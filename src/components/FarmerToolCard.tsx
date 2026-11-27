import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FarmProfile } from '../db/schema';
import { Copy, Language } from '../i18n/copy';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { areaUnitLabel } from '../i18n/vocab';
import { shared } from '../styles/shared';
import { GREEN, LIGHT_GREEN, DANGER, MUTED } from '../theme';
import { WeatherCard } from './WeatherCard';

export function FarmerToolCard({
  t: propT,
  language: propLanguage,
  lg,
  workspaceName,
  plotsCount,
  farmProfile,
}: {
  t?: Copy;
  language?: Language;
  lg: boolean;
  workspaceName: string;
  plotsCount: number;
  farmProfile?: FarmProfile | null;
}) {
  const activeLang = useActiveLanguage();
  const t = propT || activeLang.t;
  const language = propLanguage || activeLang.language || 'en';

  const [activeTab, setActiveTab] = useState<'weather' | 'converter' | 'profit'>('weather');

  // Land converter state
  const [areaInput, setAreaInput] = useState('1');
  const [areaUnit, setAreaUnit] = useState<'acres' | 'guntas' | 'hectares'>('acres');

  const numericArea = parseFloat(areaInput) || 0;
  let acres = 0;
  let guntas = 0;
  let hectares = 0;

  if (areaUnit === 'acres') {
    acres = numericArea;
    guntas = numericArea * 40;
    hectares = numericArea * 0.404686;
  } else if (areaUnit === 'guntas') {
    acres = numericArea / 40;
    guntas = numericArea;
    hectares = numericArea * 0.010117;
  } else {
    acres = numericArea * 2.47105;
    guntas = numericArea * 98.8422;
    hectares = numericArea;
  }

  // Profit / Margin planner state
  const [yieldInput, setYieldInput] = useState('1000');
  const [priceInput, setPriceInput] = useState('25');
  const [expenseInput, setExpenseInput] = useState('12000');

  const expectedYield = parseFloat(yieldInput) || 0;
  const sellingPrice = parseFloat(priceInput) || 0;
  const estimatedExpenses = parseFloat(expenseInput) || 0;

  const projectedRevenue = expectedYield * sellingPrice;
  const netProfit = projectedRevenue - estimatedExpenses;
  const isProfitable = netProfit >= 0;
  const profitMarginPct = projectedRevenue > 0 ? Math.round((netProfit / projectedRevenue) * 100) : 0;

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, { backgroundColor: '#FFFFFF', borderColor: '#D9E8DD' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1, minWidth: 0 }}>
          <Ionicons name="leaf-outline" size={18} color={GREEN} />
          <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { fontSize: 16, flexShrink: 1, minWidth: 0 }]}>
            {t.farmerTools}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: GREEN, flexShrink: 0 }}>
          {t.interactiveHub}
        </Text>
      </View>

      <View style={shared.segmentRow}>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'weather' && shared.segmentItemActive]}
          onPress={() => setActiveTab('weather')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="partly-sunny-outline" size={14} color={activeTab === 'weather' ? GREEN : MUTED} />
            <Text style={[shared.segmentText, activeTab === 'weather' && shared.segmentTextActive]}>
              {t.toolWeather}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'converter' && shared.segmentItemActive]}
          onPress={() => setActiveTab('converter')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="resize-outline" size={14} color={activeTab === 'converter' ? GREEN : MUTED} />
            <Text style={[shared.segmentText, activeTab === 'converter' && shared.segmentTextActive]}>
              {t.toolLandUnit}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'profit' && shared.segmentItemActive]}
          onPress={() => setActiveTab('profit')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="cash-outline" size={14} color={activeTab === 'profit' ? GREEN : MUTED} />
            <Text style={[shared.segmentText, activeTab === 'profit' && shared.segmentTextActive]}>
              {t.toolProfitPlanner}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'weather' && (
        <WeatherCard
          t={t}
          language={language}
          workspaceName={workspaceName}
          plotsCount={plotsCount}
          farmProfile={farmProfile}
        />
      )}

      {activeTab === 'converter' && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#66756B' }}>{t.landConverterDesc}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={shared.fieldLabel}>{t.enterArea}</Text>
              <TextInput
                value={areaInput}
                onChangeText={setAreaInput}
                keyboardType="numeric"
                style={shared.input}
                placeholder="1"
              />
            </View>
            <View style={{ flex: 1, minWidth: 140 }}>
              <Text style={shared.fieldLabel}>{t.selectUnit}</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                {(['acres', 'guntas', 'hectares'] as const).map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      shared.chip,
                      areaUnit === u && shared.chipSelected,
                      { flex: 1, minWidth: 50, alignItems: 'center', paddingVertical: 10 },
                    ]}
                    onPress={() => setAreaUnit(u)}
                  >
                    <Text style={[shared.chipText, areaUnit === u && shared.chipTextSelected, { fontSize: 11 }]}>
                      {areaUnitLabel(language, u)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            <View style={[shared.stat, { padding: 10, minWidth: 80, flex: 1 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>{areaUnitLabel(language, 'acres')}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{acres.toFixed(2)}</Text>
            </View>
            <View style={[shared.stat, { padding: 10, minWidth: 80, flex: 1 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>{areaUnitLabel(language, 'guntas')}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{guntas.toFixed(1)}</Text>
            </View>
            <View style={[shared.stat, { padding: 10, minWidth: 80, flex: 1 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>{areaUnitLabel(language, 'hectares')}</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{hectares.toFixed(3)}</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'profit' && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#66756B' }}>{t.profitPlannerDesc}</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={shared.fieldLabel}>{t.expectedYieldKg}</Text>
              <TextInput
                value={yieldInput}
                onChangeText={setYieldInput}
                keyboardType="numeric"
                style={shared.input}
                placeholder="1000"
              />
            </View>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={shared.fieldLabel}>{t.pricePerKg}</Text>
              <TextInput
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="numeric"
                style={shared.input}
                placeholder="25"
              />
            </View>
          </View>
          <View>
            <Text style={shared.fieldLabel}>{t.estimatedExpensesLabel}</Text>
            <TextInput
              value={expenseInput}
              onChangeText={setExpenseInput}
              keyboardType="numeric"
              style={shared.input}
              placeholder="12000"
            />
          </View>

          <View style={{ backgroundColor: LIGHT_GREEN, borderRadius: 14, padding: 14, marginTop: 4, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <Text style={{ fontSize: 13, color: '#4A6B53', fontWeight: '600', flexShrink: 1 }}>
                {t.projectedRevenue}:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: GREEN, flexShrink: 0 }}>
                ₹{projectedRevenue.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <Text style={{ fontSize: 13, color: '#4A6B53', fontWeight: '600', flexShrink: 1 }}>
                {t.estimatedExpensesSummary}:
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: DANGER, flexShrink: 0 }}>
                ₹{estimatedExpenses.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#C8E6C9', marginVertical: 4 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#183326', flexShrink: 1 }}>
                {isProfitable ? t.netProjectedProfit : t.netProjectedLoss}:
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: isProfitable ? GREEN : DANGER, flexShrink: 0 }}>
                {isProfitable ? '+' : ''}₹{netProfit.toLocaleString('en-IN')}
              </Text>
            </View>
            {projectedRevenue > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#4A6B53', fontWeight: '600' }}>
                  {t.profitMargin}:
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: isProfitable ? GREEN : DANGER }}>
                  {profitMarginPct}%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
