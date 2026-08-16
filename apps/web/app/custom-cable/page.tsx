'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ConnectorDto,
  CableTypeConfigDto,
  WireConnectionDto,
  PriceBreakdown,
  WiringValidationResult,
  JacketMaterial,
  CableShieldingType,
} from '@cables/types';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StepIndicator } from '@/components/configurator/StepIndicator';
import { ConnectorSelector } from '@/components/configurator/ConnectorSelector';
import { CableSpecsForm } from '@/components/configurator/CableSpecsForm';
import { WiringCanvas } from '@/components/configurator/WiringCanvas';
import { ReviewStep } from '@/components/configurator/ReviewStep';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';

export default function CustomCablePage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // Data states
  const [connectors, setConnectors] = useState<ConnectorDto[]>([]);
  const [cableTypes, setCableTypes] = useState<CableTypeConfigDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Cable Configuration State
  const [customCableName, setCustomCableName] = useState('Custom Precision Interconnect');
  const [end1Connector, setEnd1Connector] = useState<ConnectorDto | null>(null);
  const [end2Connector, setEnd2Connector] = useState<ConnectorDto | null>(null);
  const [cableTypeId, setCableTypeId] = useState<string>('');
  const [lengthMeters, setLengthMeters] = useState<number>(2.0);
  const [cableColor, setCableColor] = useState<string>('#000000');
  const [jacketMaterial, setJacketMaterial] = useState<JacketMaterial>(JacketMaterial.PVC);
  const [shieldingType, setShieldingType] = useState<CableShieldingType>(CableShieldingType.FOIL_SHIELDED);
  const [manufacturingNotes, setManufacturingNotes] = useState<string>('');

  // Wiring & Pricing State
  const [connections, setConnections] = useState<WireConnectionDto[]>([]);
  const [validationResult, setValidationResult] = useState<WiringValidationResult | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown>({
    baseCablePrice: 0,
    connector1Price: 160,
    connector2Price: 90,
    lengthCost: 240,
    assemblyFee: 370,
    perPinConnectionFee: 120,
    subtotal: 860,
    taxRatePercent: 18,
    taxAmount: 154.8,
    shippingFee: 0,
    total: 1014.8,
  });

  // Fetch connectors and cable types
  useEffect(() => {
    async function loadData() {
      try {
        const [connData, typeData] = await Promise.all([
          apiClient<ConnectorDto[]>('/connectors'),
          apiClient<CableTypeConfigDto[]>('/cable-types'),
        ]);
        setConnectors(connData);
        setCableTypes(typeData);

        if (connData.length >= 2) {
          const hdmi = connData.find((c) => c.type === 'HDMI') || connData[0];
          const rj45 = connData.find((c) => c.type === 'RJ45') || connData[1];
          setEnd1Connector(hdmi);
          setEnd2Connector(rj45);

          // Initial sample connection preset
          const initialConns: WireConnectionDto[] = [];
          const minP = Math.min(hdmi.pins.length, rj45.pins.length, 8);
          for (let i = 0; i < minP; i++) {
            initialConns.push({
              sourcePinId: hdmi.pins[i].id,
              targetPinId: rj45.pins[i].id,
              wireColor: hdmi.pins[i].color || '#3B82F6',
              label: `W-${i + 1}`,
            });
          }
          setConnections(initialConns);
        }

        if (typeData.length > 0) {
          setCableTypeId(typeData[0].id);
        }
      } catch (err) {
        console.error('Failed to load configurator seed data from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Live recalculate pricing and validation
  const runValidationAndPricing = async (conns = connections) => {
    if (!end1Connector || !end2Connector || !cableTypeId) return;

    try {
      // 1. Authoritative backend validation
      const valReport = await apiClient<WiringValidationResult>('/wiring/validate', {
        method: 'POST',
        body: JSON.stringify({
          connector1Id: end1Connector.id,
          connector2Id: end2Connector.id,
          connections: conns,
        }),
      });
      setValidationResult(valReport);

      // 2. Authoritative backend pricing
      const priceReport = await apiClient<PriceBreakdown>('/pricing/calculate', {
        method: 'POST',
        body: JSON.stringify({
          connector1Id: end1Connector.id,
          connector2Id: end2Connector.id,
          cableTypeId,
          lengthMeters,
          connectionsCount: conns.length,
        }),
      });
      setPricing(priceReport);
    } catch (err) {
      console.error('Calculation error:', err);
    }
  };

  const handleConnectionsChange = (newConns: WireConnectionDto[]) => {
    setConnections(newConns);
    runValidationAndPricing(newConns);
  };

  const handleNextStep = async () => {
    if (currentStep === 3 || currentStep === 4) {
      await runValidationAndPricing();
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    if (next > maxStepReached) setMaxStepReached(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async () => {
    if (!end1Connector || !end2Connector || !cableTypeId) return;

    try {
      // 1. Save custom cable record in NestJS
      const customCable = await apiClient<any>('/custom-cables', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          name: customCableName,
          connector1Id: end1Connector.id,
          connector2Id: end2Connector.id,
          cableTypeId,
          lengthMeters,
          cableColor,
          jacketMaterial,
          shieldingType,
          notes: manufacturingNotes,
          connections,
        }),
      });

      // 2. Add to cart
      await apiClient('/cart/items', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          customCableId: customCable.id,
          quantity: 1,
        }),
      });

      router.push('/cart');
    } catch (err: any) {
      alert(`Could not add to cart: ${err?.message || 'Check connection validation'}`);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!end1Connector || !end2Connector || !cableTypeId) return;

    await apiClient<any>('/custom-cables', {
      method: 'POST',
      token: token || undefined,
      body: JSON.stringify({
        name: customCableName,
        connector1Id: end1Connector.id,
        connector2Id: end2Connector.id,
        cableTypeId,
        lengthMeters,
        cableColor,
        jacketMaterial,
        shieldingType,
        notes: manufacturingNotes,
        connections,
      }),
    });
  };

  const selectedCableType = cableTypes.find((c) => c.id === cableTypeId) || cableTypes[0];

  if (loading || !end1Connector || !end2Connector || !selectedCableType) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">INITIALIZING WIRING ENGINE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* 5-Step Progress Bar */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        maxStepReached={maxStepReached}
      />

      <div className="container mx-auto px-4 sm:px-8 pt-8">
        {/* Step 1: Select End 1 */}
        {currentStep === 1 && (
          <ConnectorSelector
            title="Step 1: Select End 1 Connector"
            subtitle="Choose the source terminal connector interface from our dynamic catalog."
            connectors={connectors}
            selectedId={end1Connector?.id || null}
            onSelect={(conn) => setEnd1Connector(conn)}
          />
        )}

        {/* Step 2: Select End 2 */}
        {currentStep === 2 && (
          <ConnectorSelector
            title="Step 2: Select End 2 Connector"
            subtitle="Choose the target terminal connector interface. Compatibility rules will be evaluated."
            connectors={connectors}
            selectedId={end2Connector?.id || null}
            onSelect={(conn) => setEnd2Connector(conn)}
            selectedEnd1={end1Connector}
          />
        )}

        {/* Step 3: Cable Specs */}
        {currentStep === 3 && (
          <CableSpecsForm
            cableTypes={cableTypes}
            selectedCableTypeId={cableTypeId}
            onSelectCableType={(id) => setCableTypeId(id)}
            lengthMeters={lengthMeters}
            onChangeLength={(l) => setLengthMeters(l)}
            jacketMaterial={jacketMaterial}
            onChangeJacket={(j) => setJacketMaterial(j)}
            shieldingType={shieldingType}
            onChangeShielding={(s) => setShieldingType(s)}
            cableColor={cableColor}
            onChangeColor={(c) => setCableColor(c)}
            notes={manufacturingNotes}
            onChangeNotes={(n) => setManufacturingNotes(n)}
          />
        )}

        {/* Step 4: Visual React Flow Wiring Editor */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Step 4: Interactive Pin-to-Pin Wiring Canvas
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Drag from End 1 handles to End 2 handles, or click a source pin and then a target pin.
              </p>
            </div>

            <WiringCanvas
              connector1={end1Connector}
              connector2={end2Connector}
              connections={connections}
              onChangeConnections={handleConnectionsChange}
              validationResult={validationResult}
              onValidate={() => runValidationAndPricing()}
            />
          </div>
        )}

        {/* Step 5: Review & Place Order */}
        {currentStep === 5 && (
          <ReviewStep
            name={customCableName}
            connector1={end1Connector}
            connector2={end2Connector}
            cableType={selectedCableType}
            lengthMeters={lengthMeters}
            cableColor={cableColor}
            jacketMaterial={jacketMaterial}
            shieldingType={shieldingType}
            connections={connections}
            pricing={pricing}
            validationResult={validationResult}
            notes={manufacturingNotes}
            onAddToCart={handleAddToCart}
            onSaveToLibrary={handleSaveToLibrary}
          />
        )}

        {/* Bottom Floating Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d14]/90 border-t border-slate-800 backdrop-blur-lg py-3 px-4 sm:px-8">
          <div className="container mx-auto flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="gap-2 border-slate-700 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Price</span>
                <span className="text-base font-bold font-mono text-white">
                  ₹{pricing.total.toFixed(2)}
                </span>
              </div>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  size="default"
                  onClick={handleNextStep}
                  className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                >
                  <span>Proceed to Step {currentStep + 1}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="cyber"
                  onClick={handleAddToCart}
                  disabled={!validationResult?.isValid}
                  className="gap-2 font-semibold"
                >
                  <span>Add Custom Cable to Cart</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
