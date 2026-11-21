import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Copy } from '../i18n/copy';
import { shared } from '../styles/shared';
import { GREEN, LIGHT_GREEN, DANGER } from '../theme';

export function FarmerToolCard({
  t, lg, workspaceName, plotsCount,
}: {
  t: Copy;
  lg: boolean;
  workspaceName: string;
  plotsCount: number;
}) {
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

  // Profit planner state
  const [yieldInput, setYieldInput] = useState('1000');
  const [priceInput, setPriceInput] = useState('25');
  const [expenseInput, setExpenseInput] = useState('12000');

  const expectedYield = parseFloat(yieldInput) || 0;
  const sellingPrice = parseFloat(priceInput) || 0;
  const estimatedExpenses = parseFloat(expenseInput) || 0;

  const projectedRevenue = expectedYield * sellingPrice;
  const netProfit = projectedRevenue - estimatedExpenses;
  const isProfitable = netProfit >= 0;

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, { backgroundColor: '#FFFFFF', borderColor: '#D9E8DD' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { fontSize: 16 }]}>🌱 {t.farmerTools}</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: GREEN }}>Interactive Hub</Text>
      </View>

      <View style={shared.segmentRow}>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'weather' && shared.segmentItemActive]}
          onPress={() => setActiveTab('weather')}
        >
          <Text style={[shared.segmentText, activeTab === 'weather' && shared.segmentTextActive]}>🌤 Weather</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'converter' && shared.segmentItemActive]}
          onPress={() => setActiveTab('converter')}
        >
          <Text style={[shared.segmentText, activeTab === 'converter' && shared.segmentTextActive]}>📐 Land Unit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[shared.segmentItem, activeTab === 'profit' && shared.segmentItemActive]}
          onPress={() => setActiveTab('profit')}
        >
          <Text style={[shared.segmentText, activeTab === 'profit' && shared.segmentTextActive]}>💰 Profit Planner</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'weather' && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: LIGHT_GREEN, padding: 12, borderRadius: 12 }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN }}>{workspaceName}</Text>
              <Text style={{ fontSize: 12, color: '#4A6B53', marginTop: 2 }}>Active Plots: {plotsCount}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: GREEN }}>28°C</Text>
              <Text style={{ fontSize: 11, color: '#4A6B53' }}>Partly Cloudy</Text>
            </View>
          </View>
          <View style={{ borderWidth: 1, borderColor: '#E5ECE6', borderRadius: 12, padding: 12, backgroundColor: '#F9FCF9' }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: '#183326', marginBottom: 4 }}>🌾 Irrigation & Farming Advisory</Text>
            <Text style={{ fontSize: 12, color: '#52675A', lineHeight: 18 }}>
              Soil moisture levels are optimal. Light irrigation recommended in the early morning for active plots. Favorable weather for sowing and fertilizer application over the next 48 hours.
            </Text>
          </View>
        </View>
      )}

      {activeTab === 'converter' && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#66756B' }}>Convert land measurements dynamically across regional and standard units.</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={shared.fieldLabel}>Enter Area</Text>
              <TextInput
                value={areaInput}
                onChangeText={setAreaInput}
                keyboardType="numeric"
                style={shared.input}
                placeholder="1"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={shared.fieldLabel}>Select Unit</Text>
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                {(['acres', 'guntas', 'hectares'] as const).map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[shared.chip, areaUnit === u && shared.chipSelected, { flex: 1, alignItems: 'center', paddingVertical: 10 }]}
                    onPress={() => setAreaUnit(u)}
                  >
                    <Text style={[shared.chipText, areaUnit === u && shared.chipTextSelected, { fontSize: 10 }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <View style={[shared.stat, { padding: 10 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>Acres</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{acres.toFixed(2)}</Text>
            </View>
            <View style={[shared.stat, { padding: 10 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>Guntas</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{guntas.toFixed(1)}</Text>
            </View>
            <View style={[shared.stat, { padding: 10 }]}>
              <Text style={{ fontSize: 10, color: '#66756B' }}>Hectares</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: GREEN, marginTop: 2 }}>{hectares.toFixed(3)}</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'profit' && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, color: '#66756B' }}>Calculate projected revenue, expenses, and net profit for your harvest.</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={shared.fieldLabel}>Expected Yield (Kg)</Text>
              <TextInput value={yieldInput} onChangeText={setYieldInput} keyboardType="numeric" style={shared.input} placeholder="1000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={shared.fieldLabel}>Price per Kg (₹)</Text>
              <TextInput value={priceInput} onChangeText={setPriceInput} keyboardType="numeric" style={shared.input} placeholder="25" />
            </View>
          </View>
          <View>
            <Text style={shared.fieldLabel}>Estimated Expenses (₹)</Text>
            <TextInput value={expenseInput} onChangeText={setExpenseInput} keyboardType="numeric" style={shared.input} placeholder="12000" />
          </View>

          <View style={{ backgroundColor: LIGHT_GREEN, borderRadius: 14, padding: 14, marginTop: 4, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A6B53', fontWeight: '600' }}>Projected Revenue:</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: GREEN }}>₹{projectedRevenue.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#4A6B53', fontWeight: '600' }}>Estimated Expenses:</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: DANGER }}>₹{estimatedExpenses.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#C8E6C9', marginVertical: 4 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#183326' }}>Net Projected Profit:</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: isProfitable ? GREEN : DANGER }}>
                {isProfitable ? '+' : ''}₹{netProfit.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
