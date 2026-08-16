export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  MANUFACTURING = 'MANUFACTURING'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  MANUFACTURING = 'MANUFACTURING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum CableShieldingType {
  UNSHIELDED = 'UNSHIELDED',
  FOIL_SHIELDED = 'FOIL_SHIELDED',
  BRAIDED_SHIELDED = 'BRAIDED_SHIELDED',
  DOUBLE_SHIELDED = 'DOUBLE_SHIELDED'
}

export enum JacketMaterial {
  PVC = 'PVC',
  TPE = 'TPE',
  SILICONE = 'SILICONE',
  BRAIDED_NYLON = 'BRAIDED_NYLON',
  PUR = 'PUR'
}

export enum PinType {
  POWER = 'POWER',
  GROUND = 'GROUND',
  DATA_PLUS = 'DATA_PLUS',
  DATA_MINUS = 'DATA_MINUS',
  CLOCK = 'CLOCK',
  SHIELD = 'SHIELD',
  ANALOG_AUDIO = 'ANALOG_AUDIO',
  GENERAL_SIGNAL = 'GENERAL_SIGNAL',
  HIGH_SPEED_DIFFERENTIAL = 'HIGH_SPEED_DIFFERENTIAL'
}

export interface ConnectorPinDto {
  id: string;
  connectorId: string;
  pinNumber: number;
  name: string;
  description?: string | null;
  type: PinType;
  color: string;
  position: number;
  required: boolean;
  allowMultipleConnections: boolean;
  isActive: boolean;
}

export interface ConnectorDto {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  imageUrl?: string | null;
  numberOfPins: number;
  basePrice: number;
  isActive: boolean;
  pins: ConnectorPinDto[];
}

export interface ConnectorCompatibilityDto {
  id: string;
  sourceConnectorId: string;
  targetConnectorId: string;
  isCompatible: boolean;
  specialRules?: Record<string, any> | null;
  notes?: string | null;
}

export interface CableTypeConfigDto {
  id: string;
  name: string;
  slug: string;
  pricePerMeter: number;
  shielding: CableShieldingType;
  jacket: JacketMaterial;
  colorOptions: string[];
  gaugeAWG: number;
  maxConductors: number;
  isActive: boolean;
}

export interface WireConnectionDto {
  sourcePinId: string;
  targetPinId: string;
  wireColor?: string;
  label?: string;
}

export interface WiringValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  connectedCount: number;
  totalRequiredSourcePins: number;
  totalRequiredTargetPins: number;
  missingRequiredSourcePins: ConnectorPinDto[];
  missingRequiredTargetPins: ConnectorPinDto[];
}

export interface PriceBreakdown {
  baseCablePrice: number;
  connector1Price: number;
  connector2Price: number;
  lengthCost: number;
  assemblyFee: number;
  perPinConnectionFee: number;
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
}

export interface CustomCableSpecification {
  name: string;
  connector1: ConnectorDto;
  connector2: ConnectorDto;
  cableType: CableTypeConfigDto;
  lengthMeters: number;
  cableColor: string;
  jacketMaterial: JacketMaterial;
  shieldingType: CableShieldingType;
  connections: Array<{
    sourcePin: ConnectorPinDto;
    targetPin: ConnectorPinDto;
    wireColor: string;
    label?: string;
  }>;
  pricing: PriceBreakdown;
  wiringReport: WiringValidationResult;
  manufacturingNotes?: string;
}
