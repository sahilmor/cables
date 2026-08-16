import { PrismaClient, PinType, CableShieldingType, JacketMaterial, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Pricing Rule
  const pricingRule = await prisma.pricingRule.upsert({
    where: { name: 'Standard Pricing 2026' },
    update: {},
    create: {
      name: 'Standard Pricing 2026',
      baseAssemblyFee: 250.0,
      perPinFee: 15.0,
      taxRatePercent: 18.0,
      shippingFee: 120.0,
      freeShippingMin: 2500.0,
      isActive: true,
    },
  });
  console.log('✅ Pricing rule created:', pricingRule.name);

  // 2. Cable Types
  const cableTypes = [
    {
      name: 'Industrial Cat6A Bulk S/FTP',
      slug: 'cat6a-sftp',
      pricePerMeter: 120.0,
      shielding: CableShieldingType.DOUBLE_SHIELDED,
      jacket: JacketMaterial.PUR,
      gaugeAWG: 23,
      maxConductors: 8,
      colorOptions: ['#000000', '#1E40AF', '#059669', '#DC2626', '#EAB308'],
    },
    {
      name: 'Studio Pro Balanced OFC 24AWG',
      slug: 'studio-pro-ofc-24awg',
      pricePerMeter: 145.0,
      shielding: CableShieldingType.BRAIDED_SHIELDED,
      jacket: JacketMaterial.SILICONE,
      gaugeAWG: 24,
      maxConductors: 16,
      colorOptions: ['#000000', '#475569', '#7C3AED', '#2563EB'],
    },
    {
      name: 'Ultra-Flex High-Speed Multi-Conductor 28AWG',
      slug: 'ultra-flex-multi-28awg',
      pricePerMeter: 95.0,
      shielding: CableShieldingType.FOIL_SHIELDED,
      jacket: JacketMaterial.TPE,
      gaugeAWG: 28,
      maxConductors: 24,
      colorOptions: ['#000000', '#FFFFFF', '#3B82F6', '#EF4444'],
    },
    {
      name: 'Heavy-Duty Braided Armored Cable',
      slug: 'armored-heavy-duty',
      pricePerMeter: 180.0,
      shielding: CableShieldingType.DOUBLE_SHIELDED,
      jacket: JacketMaterial.BRAIDED_NYLON,
      gaugeAWG: 22,
      maxConductors: 12,
      colorOptions: ['#000000', '#B91C1C', '#1E3A8A'],
    },
  ];

  for (const c of cableTypes) {
    await prisma.cableTypeConfig.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log('✅ Cable types seeded');

  // 3. Connectors & Pins
  const connectorsData = [
    {
      name: 'HDMI Type-A (19-Pin)',
      slug: 'hdmi-type-a',
      type: 'HDMI',
      description: 'Standard full-size 19-pin HDMI 2.0/2.1 gold-plated chassis connector.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 19,
      basePrice: 160.0,
      pins: [
        { pinNumber: 1, name: 'TMDS Data2+', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#EF4444', required: true, position: 1 },
        { pinNumber: 2, name: 'TMDS Data2 Shield', type: PinType.SHIELD, color: '#64748B', required: false, position: 2 },
        { pinNumber: 3, name: 'TMDS Data2-', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#F87171', required: true, position: 3 },
        { pinNumber: 4, name: 'TMDS Data1+', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#3B82F6', required: true, position: 4 },
        { pinNumber: 5, name: 'TMDS Data1 Shield', type: PinType.SHIELD, color: '#64748B', required: false, position: 5 },
        { pinNumber: 6, name: 'TMDS Data1-', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#60A5FA', required: true, position: 6 },
        { pinNumber: 7, name: 'TMDS Data0+', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#10B981', required: true, position: 7 },
        { pinNumber: 8, name: 'TMDS Data0 Shield', type: PinType.SHIELD, color: '#64748B', required: false, position: 8 },
        { pinNumber: 9, name: 'TMDS Data0-', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#34D399', required: true, position: 9 },
        { pinNumber: 10, name: 'TMDS Clock+', type: PinType.CLOCK, color: '#F59E0B', required: true, position: 10 },
        { pinNumber: 11, name: 'TMDS Clock Shield', type: PinType.SHIELD, color: '#64748B', required: false, position: 11 },
        { pinNumber: 12, name: 'TMDS Clock-', type: PinType.CLOCK, color: '#FBBF24', required: true, position: 12 },
        { pinNumber: 13, name: 'CEC', type: PinType.GENERAL_SIGNAL, color: '#8B5CF6', required: false, position: 13 },
        { pinNumber: 14, name: 'Utility / HEAC+', type: PinType.GENERAL_SIGNAL, color: '#EC4899', required: false, position: 14 },
        { pinNumber: 15, name: 'SCL (DDC Clock)', type: PinType.CLOCK, color: '#6366F1', required: false, position: 15 },
        { pinNumber: 16, name: 'SDA (DDC Data)', type: PinType.DATA_PLUS, color: '#A855F7', required: false, position: 16 },
        { pinNumber: 17, name: 'DDC/CEC GND', type: PinType.GROUND, color: '#1E293B', required: true, position: 17 },
        { pinNumber: 18, name: '+5V Power', type: PinType.POWER, color: '#DC2626', required: true, position: 18 },
        { pinNumber: 19, name: 'Hot Plug Detect', type: PinType.GENERAL_SIGNAL, color: '#14B8A6', required: false, position: 19 },
      ],
    },
    {
      name: 'RJ45 8P8C Modular Plug',
      slug: 'rj45-8p8c',
      type: 'RJ45',
      description: 'Shielded Cat6A 8P8C modular connector with load bar and metallic ground collar.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 8,
      basePrice: 90.0,
      pins: [
        { pinNumber: 1, name: 'Pin 1 (TX_D1+ White/Orange)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#FB923C', required: true, position: 1 },
        { pinNumber: 2, name: 'Pin 2 (TX_D1- Orange)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#EA580C', required: true, position: 2 },
        { pinNumber: 3, name: 'Pin 3 (RX_D2+ White/Green)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#4ADE80', required: true, position: 3 },
        { pinNumber: 4, name: 'Pin 4 (BI_D3+ Blue)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#3B82F6', required: true, position: 4 },
        { pinNumber: 5, name: 'Pin 5 (BI_D3- White/Blue)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#93C5FD', required: true, position: 5 },
        { pinNumber: 6, name: 'Pin 6 (RX_D2- Green)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#16A34A', required: true, position: 6 },
        { pinNumber: 7, name: 'Pin 7 (BI_D4+ White/Brown)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#A8A29E', required: true, position: 7 },
        { pinNumber: 8, name: 'Pin 8 (BI_D4- Brown)', type: PinType.HIGH_SPEED_DIFFERENTIAL, color: '#78716C', required: true, position: 8 },
      ],
    },
    {
      name: 'USB-A 2.0/3.0 Male Plug',
      slug: 'usb-a-plug',
      type: 'USB-A',
      description: 'Standard rectangular Type-A connector with heavy gold flash pins.',
      imageUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 4,
      basePrice: 75.0,
      pins: [
        { pinNumber: 1, name: 'Pin 1: VBUS (+5V)', type: PinType.POWER, color: '#EF4444', required: true, position: 1 },
        { pinNumber: 2, name: 'Pin 2: D- (Data Negative)', type: PinType.DATA_MINUS, color: '#FFFFFF', required: true, position: 2 },
        { pinNumber: 3, name: 'Pin 3: D+ (Data Positive)', type: PinType.DATA_PLUS, color: '#22C55E', required: true, position: 3 },
        { pinNumber: 4, name: 'Pin 4: GND (Ground)', type: PinType.GROUND, color: '#000000', required: true, position: 4 },
      ],
    },
    {
      name: 'USB-C Reversible Plug (12-Pin Config)',
      slug: 'usb-c-plug',
      type: 'USB-C',
      description: 'High-speed reversible USB-C plug supporting 100W PD and 10Gbps data lines.',
      imageUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 12,
      basePrice: 180.0,
      pins: [
        { pinNumber: 1, name: 'A1/B12 (GND)', type: PinType.GROUND, color: '#000000', required: true, position: 1 },
        { pinNumber: 2, name: 'A4/B9 (VBUS +5V-20V)', type: PinType.POWER, color: '#DC2626', required: true, position: 2 },
        { pinNumber: 3, name: 'A5 (CC1 Channel Config)', type: PinType.GENERAL_SIGNAL, color: '#F59E0B', required: true, position: 3 },
        { pinNumber: 4, name: 'A6 (DP1 USB 2.0 D+)', type: PinType.DATA_PLUS, color: '#22C55E', required: false, position: 4 },
        { pinNumber: 5, name: 'A7 (DN1 USB 2.0 D-)', type: PinType.DATA_MINUS, color: '#F87171', required: false, position: 5 },
        { pinNumber: 6, name: 'A8 (SBU1 Sideband)', type: PinType.GENERAL_SIGNAL, color: '#8B5CF6', required: false, position: 6 },
        { pinNumber: 7, name: 'B8 (SBU2 Sideband)', type: PinType.GENERAL_SIGNAL, color: '#EC4899', required: false, position: 7 },
        { pinNumber: 8, name: 'B7 (DN2 USB 2.0 D-)', type: PinType.DATA_MINUS, color: '#F87171', required: false, position: 8 },
        { pinNumber: 9, name: 'B6 (DP2 USB 2.0 D+)', type: PinType.DATA_PLUS, color: '#22C55E', required: false, position: 9 },
        { pinNumber: 10, name: 'B5 (CC2 Channel Config)', type: PinType.GENERAL_SIGNAL, color: '#F59E0B', required: false, position: 10 },
        { pinNumber: 11, name: 'B4/A9 (VBUS +5V-20V)', type: PinType.POWER, color: '#DC2626', required: true, position: 11 },
        { pinNumber: 12, name: 'B1/A12 (GND)', type: PinType.GROUND, color: '#000000', required: true, position: 12 },
      ],
    },
    {
      name: 'XLR 3-Pin Male Audio',
      slug: 'xlr-3pin-male',
      type: 'XLR',
      description: 'Heavy duty zinc diecast XLR male connector with silver plated contacts.',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 3,
      basePrice: 195.0,
      pins: [
        { pinNumber: 1, name: 'Pin 1: Chassis Ground / Shield', type: PinType.SHIELD, color: '#64748B', required: true, position: 1 },
        { pinNumber: 2, name: 'Pin 2: Positive / Hot (+)', type: PinType.ANALOG_AUDIO, color: '#EF4444', required: true, position: 2 },
        { pinNumber: 3, name: 'Pin 3: Negative / Cold (-)', type: PinType.ANALOG_AUDIO, color: '#3B82F6', required: true, position: 3 },
      ],
    },
    {
      name: '3.5mm TRS Stereo Mini-Jack',
      slug: '35mm-trs-stereo',
      type: '3.5mm',
      description: 'Gold-plated 3.5mm 3-pole TRS mini audio plug with brass strain relief.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 3,
      basePrice: 85.0,
      pins: [
        { pinNumber: 1, name: 'Tip (Left Channel +)', type: PinType.ANALOG_AUDIO, color: '#FFFFFF', required: true, position: 1 },
        { pinNumber: 2, name: 'Ring (Right Channel +)', type: PinType.ANALOG_AUDIO, color: '#EF4444', required: true, position: 2 },
        { pinNumber: 3, name: 'Sleeve (Common Ground)', type: PinType.GROUND, color: '#000000', required: true, position: 3 },
      ],
    },
    {
      name: 'DC Barrel Jack (5.5mm x 2.1mm)',
      slug: 'dc-barrel-55-21',
      type: 'DC Barrel',
      description: 'Standard 5.5mm outer diameter, 2.1mm inner pin DC power connector.',
      imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=60',
      numberOfPins: 2,
      basePrice: 60.0,
      pins: [
        { pinNumber: 1, name: 'Center Pin (Positive +)', type: PinType.POWER, color: '#DC2626', required: true, position: 1 },
        { pinNumber: 2, name: 'Outer Ring (Ground -)', type: PinType.GROUND, color: '#000000', required: true, position: 2 },
      ],
    },
  ];

  const connectorMap: Record<string, any> = {};

  for (const item of connectorsData) {
    const { pins, ...connInfo } = item;
    const connector = await prisma.connector.upsert({
      where: { slug: connInfo.slug },
      update: connInfo,
      create: connInfo,
    });

    connectorMap[connector.slug] = connector;

    for (const p of pins) {
      await prisma.connectorPin.upsert({
        where: {
          connectorId_pinNumber: {
            connectorId: connector.id,
            pinNumber: p.pinNumber,
          },
        },
        update: {
          name: p.name,
          type: p.type,
          color: p.color,
          position: p.position,
          required: p.required,
        },
        create: {
          connectorId: connector.id,
          pinNumber: p.pinNumber,
          name: p.name,
          type: p.type,
          color: p.color,
          position: p.position,
          required: p.required,
        },
      });
    }
  }
  console.log('✅ Connectors and pins seeded');

  // 4. Compatibility Matrix
  const compatibilities = [
    { src: 'hdmi-type-a', target: 'hdmi-type-a', allowed: true, notes: 'Direct HDMI 1:1 pin pass-through' },
    { src: 'hdmi-type-a', target: 'rj45-8p8c', allowed: true, notes: 'HDMI over Cat6 Balun/Extender mapping' },
    { src: 'rj45-8p8c', target: 'rj45-8p8c', allowed: true, notes: 'Standard T568B / T568A Ethernet Patch' },
    { src: 'usb-a-plug', target: 'usb-c-plug', allowed: true, notes: 'USB-A to USB-C Legacy Cable' },
    { src: 'usb-c-plug', target: 'usb-c-plug', allowed: true, notes: 'Full-featured USB-C to USB-C' },
    { src: 'xlr-3pin-male', target: '35mm-trs-stereo', allowed: true, notes: 'Pro Audio Balanced XLR to Stereo 3.5mm' },
    { src: 'xlr-3pin-male', target: 'xlr-3pin-male', allowed: true, notes: 'Standard Balanced Microphone Cable' },
    { src: '35mm-trs-stereo', target: '35mm-trs-stereo', allowed: true, notes: 'Standard 3.5mm Stereo Aux Cable' },
    { src: 'dc-barrel-55-21', target: 'dc-barrel-55-21', allowed: true, notes: 'DC Power Extension' },
    { src: 'usb-a-plug', target: 'dc-barrel-55-21', allowed: true, notes: '5V USB to DC Barrel Power Lead' },
  ];

  for (const comp of compatibilities) {
    const s = connectorMap[comp.src];
    const t = connectorMap[comp.target];
    if (s && t) {
      await prisma.connectorCompatibility.upsert({
        where: {
          sourceConnectorId_targetConnectorId: {
            sourceConnectorId: s.id,
            targetConnectorId: t.id,
          },
        },
        update: { isCompatible: comp.allowed, notes: comp.notes },
        create: {
          sourceConnectorId: s.id,
          targetConnectorId: t.id,
          isCompatible: comp.allowed,
          notes: comp.notes,
        },
      });
    }
  }
  console.log('✅ Connector compatibility rules seeded');

  // 5. Standard Categories & Products
  const categoriesData = [
    {
      name: 'Video & Display Cables',
      slug: 'video-display',
      description: 'Ultra high definition HDMI 2.1, DisplayPort 1.4, and industrial video interconnects.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      products: [
        {
          name: 'Pro Ultra HDMI 2.1 8K 60Hz Cable',
          slug: 'pro-ultra-hdmi-2-1',
          sku: 'CBL-HDMI-8K-PRO',
          description: 'Certified Ultra High Speed HDMI cable supporting 48Gbps bandwidth, 8K@60Hz, 4K@120Hz, Dynamic HDR, and eARC.',
          price: 1299.0,
          compareAtPrice: 1799.0,
          stock: 85,
          cableType: 'Triple Shielded Copper',
          connectorType: 'Gold Plated HDMI Type-A',
          lengthOptions: ['1m', '2m', '3m', '5m'],
          images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'],
        },
        {
          name: 'DisplayPort 1.4 HBR3 8K Cable',
          slug: 'displayport-1-4-hbr3',
          sku: 'CBL-DP-14-PRO',
          description: 'High Bit Rate 3 DisplayPort cable supporting 32.4Gbps bandwidth, DSC 1.2, and 240Hz refresh rate at 1440p.',
          price: 1450.0,
          compareAtPrice: 1999.0,
          stock: 42,
          cableType: 'OFC Foil+Braid Shielded',
          connectorType: 'Latch Lock DisplayPort 20-Pin',
          lengthOptions: ['1.5m', '2m', '3m', '5m'],
          images: ['https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80'],
        },
      ],
    },
    {
      name: 'Networking & Ethernet',
      slug: 'networking-ethernet',
      description: 'Category 6A, 7, and 8 high-bandwidth shielded patch cords for datacenters and high-speed LAN.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      products: [
        {
          name: 'Cat6A S/FTP 10Gbps 500MHz Patch Cord',
          slug: 'cat6a-sftp-10g-patch',
          sku: 'CBL-CAT6A-10G',
          description: 'Individually shielded twisted pairs with overall braided shield. Snagless boot with 50µ gold plated contacts.',
          price: 499.0,
          compareAtPrice: 699.0,
          stock: 220,
          cableType: '26AWG Stranded Pure Bare Copper',
          connectorType: 'RJ45 Shielded',
          lengthOptions: ['0.5m', '1m', '2m', '3m', '5m', '10m'],
          images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
        },
        {
          name: 'Cat8 40Gbps Heavy Duty Armored LAN Cable',
          slug: 'cat8-40gbps-armored',
          sku: 'CBL-CAT8-40G',
          description: 'Industrial grade 2000MHz bandwidth Cat8 cable for servers, direct NAS connections, and interference-heavy environments.',
          price: 1150.0,
          compareAtPrice: 1590.0,
          stock: 65,
          cableType: 'Double Shielded S/FTP 22AWG',
          connectorType: 'Zinc Alloy RJ45',
          lengthOptions: ['1m', '2m', '3m', '5m'],
          images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'],
        },
      ],
    },
    {
      name: 'Pro Studio & Audio',
      slug: 'pro-studio-audio',
      description: 'Low-noise balanced microphone lines, instrument cables, and studio reference interconnects.',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      products: [
        {
          name: 'TourGrade XLR-M to XLR-F Balanced Mic Cable',
          slug: 'tourgrade-xlr-balanced',
          sku: 'CBL-XLR-TG',
          description: 'Tour-grade 99.99% OFC dual conductor with conductive PE sub-shield and heavy spiral copper outer shield.',
          price: 890.0,
          compareAtPrice: 1250.0,
          stock: 90,
          cableType: 'Dual Twisted Balanced OFC',
          connectorType: 'Neutrik Style 3-Pin XLR',
          lengthOptions: ['1m', '3m', '5m', '10m'],
          images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80'],
        },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const { products, ...catInfo } = cat;
    const category = await prisma.category.upsert({
      where: { slug: catInfo.slug },
      update: catInfo,
      create: catInfo,
    });

    for (const prod of products) {
      const { images, ...prodInfo } = prod;
      const createdProd = await prisma.product.upsert({
        where: { slug: prodInfo.slug },
        update: {
          ...prodInfo,
          categoryId: category.id,
        },
        create: {
          ...prodInfo,
          categoryId: category.id,
        },
      });

      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: createdProd.id,
            url: images[i],
            position: i,
          },
        });
      }
    }
  }
  console.log('✅ Categories and standard products seeded');

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
