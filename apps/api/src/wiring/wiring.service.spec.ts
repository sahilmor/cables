import { WiringService } from './wiring.service';
import { PinType } from '@prisma/client';

describe('WiringService', () => {
  let service: WiringService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      connector: {
        findUnique: jest.fn(),
      },
      connectorCompatibility: {
        findFirst: jest.fn(),
      },
    };
    service = new WiringService(mockPrisma);
  });

  it('should validate complete required pin connections successfully', async () => {
    mockPrisma.connector.findUnique
      .mockResolvedValueOnce({
        id: 'conn-1',
        name: 'HDMI Type-A',
        pins: [
          { id: 'p1', pinNumber: 1, name: 'TMDS Data2+', required: true, allowMultipleConnections: false, type: PinType.HIGH_SPEED_DIFFERENTIAL },
          { id: 'p2', pinNumber: 2, name: 'TMDS Data2 Shield', required: false, allowMultipleConnections: false, type: PinType.SHIELD },
        ],
      })
      .mockResolvedValueOnce({
        id: 'conn-2',
        name: 'RJ45',
        pins: [
          { id: 'p3', pinNumber: 1, name: 'TX_D1+', required: true, allowMultipleConnections: false, type: PinType.HIGH_SPEED_DIFFERENTIAL },
          { id: 'p4', pinNumber: 2, name: 'TX_D1-', required: false, allowMultipleConnections: false, type: PinType.HIGH_SPEED_DIFFERENTIAL },
        ],
      });

    mockPrisma.connectorCompatibility.findFirst.mockResolvedValue({ isCompatible: true });

    const result = await service.validateConfiguration('conn-1', 'conn-2', [
      { sourcePinId: 'p1', targetPinId: 'p3' },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.connectedCount).toBe(1);
  });

  it('should detect missing required pins', async () => {
    mockPrisma.connector.findUnique
      .mockResolvedValueOnce({
        id: 'conn-1',
        name: 'HDMI Type-A',
        pins: [
          { id: 'p1', pinNumber: 1, name: 'TMDS Data2+', required: true, allowMultipleConnections: false, type: PinType.HIGH_SPEED_DIFFERENTIAL },
        ],
      })
      .mockResolvedValueOnce({
        id: 'conn-2',
        name: 'RJ45',
        pins: [
          { id: 'p2', pinNumber: 1, name: 'TX_D1+', required: true, allowMultipleConnections: false, type: PinType.HIGH_SPEED_DIFFERENTIAL },
        ],
      });

    mockPrisma.connectorCompatibility.findFirst.mockResolvedValue({ isCompatible: true });

    const result = await service.validateConfiguration('conn-1', 'conn-2', []);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing required connections'))).toBe(true);
  });

  it('should reject short-circuit power-to-ground connections', async () => {
    mockPrisma.connector.findUnique
      .mockResolvedValueOnce({
        id: 'conn-1',
        name: 'USB-A',
        pins: [
          { id: 'p1', pinNumber: 1, name: 'VBUS', required: true, allowMultipleConnections: false, type: PinType.POWER },
        ],
      })
      .mockResolvedValueOnce({
        id: 'conn-2',
        name: 'DC Barrel',
        pins: [
          { id: 'p2', pinNumber: 2, name: 'GND', required: true, allowMultipleConnections: false, type: PinType.GROUND },
        ],
      });

    mockPrisma.connectorCompatibility.findFirst.mockResolvedValue({ isCompatible: true });

    const result = await service.validateConfiguration('conn-1', 'conn-2', [
      { sourcePinId: 'p1', targetPinId: 'p2' },
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Short circuit hazard'))).toBe(true);
  });
});
