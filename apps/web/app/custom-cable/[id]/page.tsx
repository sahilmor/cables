'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function EditCustomCablePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, token } = useAuth();

  const [currentStep, setCurrentStep] = useState(4); // Start at wiring step for saved cables
  const [maxStepReached, setMaxStepReached] = useState(5);

  const [connectors, setConnectors] = useState<ConnectorDto[]>([]);
  const [cableTypes, setCableTypes] = useState<CableTypeConfigDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [customCableName, setCustomCableName] = useState('');
  const [end1Connector, setEnd1Connector] = useState<ConnectorDto | null>(null);
  const [end2Connector, setEnd2Connector] = useState<ConnectorDto | null>(null);
  const [cableTypeId, setCableTypeId] = useState<string>('');
  const [lengthMeters, setLengthMeters] = useState<number>(2.0);
  const [cableColor, setCableColor] = useState<string>('#000000');
  const [jacketMaterial, setJacketMaterial] = useState<JacketMaterial>(JacketMaterial.PVC);
  const [shieldingType, setShieldingType] = useState<CableShieldingType>(CableShieldingType.FOIL_SHIELDED);
  const [manufacturingNotes, setManufacturingNotes] = useState<string>('');

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

  useEffect(() => {
    async function loadData() {
      try {
        const [connData, typeData, cableData] = await Promise.all([
          apiClient<ConnectorDto[]>('/connectors'),
          apiClient<CableTypeConfigDto[]>('/cable-types'),
          apiClient<any>(`/custom-cables/${id}`),
        ]);

        setConnectors(connData);
        setCableTypes(typeData);

        if (cableData) {
          setCustomCableName(cableData.name);
          setEnd1Connector(cableData.connector1);
          setEnd2Connector(cableData.connector2);
          setCableTypeId(cableData.cableTypeId);
          setLengthMeters(Number(cableData.lengthMeters));
          setCableColor(cableData.cableColor);
          setJacketMaterial(cableData.jacketMaterial as JacketMaterial);
          setShieldingType(cableData.shieldingType as CableShieldingType);
          setManufacturingNotes(cableData.notes || '');

          const formattedConns: WireConnectionDto[] = (cableData.connections || []).map(
            (c: any) => ({
              sourcePinId: c.sourcePinId,
              targetPinId: c.targetPinId,
              wireColor: c.wireColor,
              label: c.label,
            }),
          );
          setConnections(formattedConns);
          setValidationResult(cableData.validationReport);
          if (cableData.priceBreakdown) {
            setPricing(cableData.priceBreakdown);
          }
        }
      } catch (err) {
        console.error('Failed to load custom cable:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const runValidationAndPricing = async (conns = connections) => {
    if (!end1Connector || !end2Connector || !cableTypeId) return;

    try {
      const valReport = await apiClient<WiringValidationResult>('/wiring/validate', {
        method: 'POST',
        body: JSON.stringify({
          connector1Id: end1Connector.id,
          connector2Id: end2Connector.id,
          connections: conns,
        }),
      });
      setValidationResult(valReport);

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

  const handleAddToCart = async () => {
    if (!end1Connector || !end2Connector || !cableTypeId) return;

    try {
      await apiClient(`/custom-cables/${id}`, {
        method: 'PATCH',
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

      await apiClient('/cart/items', {
        method: 'POST',
        token: token || undefined,
        body: JSON.stringify({
          customCableId: id,
          quantity: 1,
        }),
      });

      router.push('/cart');
    } catch (err: any) {
      alert(`Could not add to cart: ${err?.message || 'Check validation'}`);
    }
  };

  const handleSaveToLibrary = async () => {
    await apiClient(`/custom-cables/${id}`, {
      method: 'PATCH',
      token: token || undefined,
      body: JSON.stringify({
        name: customCableName,
        connector1Id: end1Connector?.id,
        connector2Id: end2Connector?.id,
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
        <p className="text-sm font-mono text-slate-400">LOADING CUSTOM CABLE CONFIGURATION...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <StepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        maxStepReached={maxStepReached}
      />

      <div className="container mx-auto px-4 sm:px-8 pt-8">
        {currentStep === 1 && (
          <ConnectorSelector
            title="Step 1: Select End 1 Connector"
            subtitle="Update the source terminal connector."
            connectors={connectors}
            selectedId={end1Connector?.id || null}
            onSelect={(conn) => setEnd1Connector(conn)}
          />
        )}

        {currentStep === 2 && (
          <ConnectorSelector
            title="Step 2: Select End 2 Connector"
            subtitle="Update the target terminal connector."
            connectors={connectors}
            selectedId={end2Connector?.id || null}
            onSelect={(conn) => setEnd2Connector(conn)}
            selectedEnd1={end1Connector}
          />
        )}

        {currentStep === 3 && (
          <CableSpecsForm
            cableTypes={cableTypes}
            selectedCableTypeId={cableTypeId}
            onSelectCableType={(typeId) => setCableTypeId(typeId)}
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

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Edit Pin-to-Pin Wiring Canvas
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Modify connections or re-assign pins in real time.
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

        {/* Bottom Floating Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d14]/90 border-t border-slate-800 backdrop-blur-lg py-3 px-4 sm:px-8">
          <div className="container mx-auto flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((p) => Math.max(p - 1, 1))}
              disabled={currentStep === 1}
              className="gap-2 border-slate-700 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Price</span>
                <span className="text-base font-bold font-mono text-white">
                  ₹{pricing.total.toFixed(2)}
                </span>
              </div>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  size="default"
                  onClick={() => setCurrentStep((p) => Math.min(p + 1, 5))}
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
                  <span>Update & Add to Cart</span>
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
