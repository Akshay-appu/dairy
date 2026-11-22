import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import {
  CropSchedule,
  listCropSchedules,
  addCropSchedule,
  deleteCropSchedule,
} from '../db/cropSchedulesRepo';
import { FormField } from './FormField';
import { Copy, Language } from '../i18n/copy';
import { useActiveLanguage } from '../i18n/LanguageContext';
import { GREEN, LIGHT_GREEN, DANGER, INK, MUTED } from '../theme';
import { shared } from '../styles/shared';

export type StageCategory = 'Germination' | 'Vegetative' | 'Flowering/Fruiting' | 'Harvest';

export interface StageDefinition {
  stageNumber: number;
  name: string;
  category: StageCategory;
  startDay: number;
  endDay: number;
  irrigationReminder: string;
  fertilizerReminder: string;
}

export interface CropGrowthProfile {
  crop: string;
  emoji: string;
  label: string;
  totalDays: number;
  stages: StageDefinition[];
}

function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date();
}

function addDays(baseDate: Date, days: number): Date {
  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateShort(d: Date, language: Language = 'en'): string {
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsKn = ['ಜನ', 'ಫೆಬ್ರ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿ', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗ', 'ಸೆಪ್ಟೆಂ', 'ಅಕ್ಟೋ', 'ನವೆಂ', 'ಡಿಸೆಂ'];
  const monthsHi = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिस'];
  const months = language === 'kn' ? monthsKn : language === 'hi' ? monthsHi : monthsEn;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getDaysSinceSowing(sowingDateStr: string): number {
  const sowing = parseLocalDate(sowingDateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today.getTime() - sowing.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getCropEmoji(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('ಭತ್ತ') || lower.includes('धान') || lower.includes('चावल')) return '🌾';
  if (lower.includes('wheat') || lower.includes('ಗೋಧಿ') || lower.includes('गेहूं')) return '🌿';
  if (lower.includes('cotton') || lower.includes('ಹತ್ತಿ') || lower.includes('कपास')) return '☁️';
  if (lower.includes('tomato') || lower.includes('ಟೊಮ್ಯಾಟೊ') || lower.includes('टमाटर')) return '🍅';
  if (lower.includes('ragi') || lower.includes('ರಾಗಿ') || lower.includes('रागी') || lower.includes('millet')) return '🥣';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('ಮೆಕ್ಕೆಜೋಳ') || lower.includes('मक्का')) return '🌽';
  if (lower.includes('chilli') || lower.includes('chili') || lower.includes('ಮೆಣಸಿನಕಾಯಿ') || lower.includes('मिर्च')) return '🌶️';
  if (lower.includes('sugarcane') || lower.includes('ಕಬ್ಬು') || lower.includes('गन्ना')) return '🎋';
  if (lower.includes('onion') || lower.includes('ಈರುಳ್ಳಿ') || lower.includes('प्याज')) return '🧅';
  if (lower.includes('potato') || lower.includes('ಆಲೂಗಡ್ಡೆ') || lower.includes('आलू')) return '🥔';
  if (lower.includes('pulse') || lower.includes('soy') || lower.includes('ದಾಳ') || lower.includes('दाल') || lower.includes('ಗ್ರಾಮ')) return '🌱';
  if (lower.includes('mango') || lower.includes('ಮಾವಿನ') || lower.includes('आम')) return '🥭';
  return '🌱';
}

function getPaddyProfile(displayName: string, language: Language): CropGrowthProfile {
  return {
    crop: displayName,
    emoji: '🌾',
    label: displayName,
    totalDays: 130,
    stages: [
      {
        stageNumber: 1,
        name: language === 'kn' ? 'ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ ಮತ್ತು ಸಸಿ ಮಡಿ' : language === 'hi' ? 'अंकुरण एवं नर्सरी' : 'Germination & Seedling',
        category: 'Germination',
        startDay: 0,
        endDay: 20,
        irrigationReminder: language === 'kn'
          ? 'ನರ್ಸರಿಯಲ್ಲಿ ಆಳವಿಲ್ಲದ 2-3 ಸೆಂ.ಮೀ ನೀರನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಸಸಿ ಮುಳುಗದಂತೆ ಅಥವಾ ಒಣಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.'
          : language === 'hi'
          ? 'नर्सरी में 2-3 सेमी उथला पानी बनाए रखें। सूखा पड़ने या डूबने से बचाएं।'
          : 'Maintain shallow water (2-3 cm) in nursery bed. Prevent drying or submergence.',
        fertilizerReminder: language === 'kn'
          ? 'ನಾಟಿಯ ಸಮಯದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಡಿಎಪಿ/ಎನ್‌ಪಿಕೆ ಮತ್ತು ಸತುವಿನ ಸಲ್ಫೇಟ್ (25 ಕೆಜಿ/ಹೆಕ್ಟೇರ್) ನೀಡಿ.'
          : language === 'hi'
          ? 'रोपाई के समय डीएपी/एनपीके का बेसल डोज + जिंक सल्फेट (25 किग्रा/हेक्टेयर) डालें।'
          : 'Basal dose of DAP/NPK + Zinc Sulphate (25 kg/ha) during transplanting.',
      },
      {
        stageNumber: 2,
        name: language === 'kn' ? 'ತೆಂಡೆ ಹೊಡೆಯುವಿಕೆ ಮತ್ತು ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ' : language === 'hi' ? 'कल्ले निकलना एवं वानस्पतिक वृद्धि' : 'Tillering & Vegetative',
        category: 'Vegetative',
        startDay: 21,
        endDay: 55,
        irrigationReminder: language === 'kn'
          ? 'ಹೊಲದಲ್ಲಿ 3-5 ಸೆಂ.ಮೀ ನೀರನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ; ಪರ್ಯಾಯವಾಗಿ ಒಣಗಿಸುವ ಮತ್ತು ನೀರುಣಿಸುವ ವಿಧಾನವನ್ನು ಅಳವಡಿಸಿ.'
          : language === 'hi'
          ? 'खेत में 3-5 सेमी पानी का स्तर रखें; बारी-बारी से गीला और सूखा करने की विधि अपनाएं।'
          : 'Maintain 3-5 cm standing water layer; adopt alternate wetting and drying.',
        fertilizerReminder: language === 'kn'
          ? 'ಸಕ್ರಿಯ ತೆಂಡೆ ಹಂತದಲ್ಲಿ (ದಿನ 25-30) ಯೂರಿಯಾದೊಂದಿಗೆ ಮೊದಲ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ.'
          : language === 'hi'
          ? 'सक्रिय कल्ले फूटने के समय (दिन 25-30) यूरिया की पहली टॉप-ड्रेसिंग करें।'
          : 'First top dressing with Urea (Nitrogen) at active tillering (Day 25-30).',
      },
      {
        stageNumber: 3,
        name: language === 'kn' ? 'ತೆನೆ ಬರುವುದು ಮತ್ತು ಹೂವಾಡುವ ಹಂತ' : language === 'hi' ? 'बाली निकलना एवं फूल आना' : 'Panicle & Flowering',
        category: 'Flowering/Fruiting',
        startDay: 56,
        endDay: 95,
        irrigationReminder: language === 'kn'
          ? 'ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಹಂತ! ಮಣ್ಣು ಒಣಗದಂತೆ ನಿರಂತರವಾಗಿ 5 ಸೆಂ.ಮೀ ನೀರನ್ನು ನಿಲ್ಲಿಸಿ.'
          : language === 'hi'
          ? 'अति महत्वपूर्ण अवस्था! मिट्टी सूखने न दें, 5 सेमी पानी का स्तर लगातार बनाए रखें।'
          : 'Critical water stage! Never let soil dry out. Keep 5 cm continuous water.',
        fertilizerReminder: language === 'kn'
          ? 'ಕಾಳು ಗಟ್ಟಿಯಾಗಿ ತುಂಬಿಕೊಳ್ಳಲು ಪೊಟ್ಯಾಶ್ ಗೊಬ್ಬರವನ್ನು (MOP) ನೀಡಿ.'
          : language === 'hi'
          ? 'दाने के अच्छे भराव के लिए पोटाश (MOP) का छिड़काव/प्रयोग करें।'
          : 'Apply Muriate of Potash (MOP) to maximize grain filling and reduce lodging.',
      },
      {
        stageNumber: 4,
        name: language === 'kn' ? 'ಕಾಳು ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು' : language === 'hi' ? 'दाना पकना एवं कटाई' : 'Grain Ripening & Harvest',
        category: 'Harvest',
        startDay: 96,
        endDay: 130,
        irrigationReminder: language === 'kn'
          ? 'ಕೊಯ್ಲಿಗೆ 10-14 ದಿನಗಳ ಮೊದಲು ಹೊಲದಲ್ಲಿನ ನೀರನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಬಸಿದುಬಿಡಿ.'
          : language === 'hi'
          ? 'कटाई से 10-14 दिन पहले खेत से पानी पूरी तरह निकाल दें।'
          : 'Drain standing water completely 10-14 days before harvest.',
        fertilizerReminder: language === 'kn'
          ? 'ಎಲ್ಲಾ ರಸಗೊಬ್ಬರಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಶೇ. 85-90 ರಷ್ಟು ತೆನೆಗಳು ಬಂಗಾರದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.'
          : language === 'hi'
          ? 'उर्वरक बंद करें। 85-90% बालियां सुनहरी होने पर कटाई करें।'
          : 'Stop all fertilizers. Harvest when 85-90% panicles turn golden straw color.',
      },
    ],
  };
}

function getWheatProfile(displayName: string, language: Language): CropGrowthProfile {
  return {
    crop: displayName,
    emoji: '🌿',
    label: displayName,
    totalDays: 120,
    stages: [
      {
        stageNumber: 1,
        name: language === 'kn' ? 'ಮೊಳಕೆ ಮತ್ತು ಕಿರೀಟ ಬೇರು ಹಂತ (CRI)' : language === 'hi' ? 'अंकुरण एवं ताज जड़ अवस्था (CRI)' : 'Germination & Crown Root (CRI)',
        category: 'Germination',
        startDay: 0,
        endDay: 21,
        irrigationReminder: language === 'kn'
          ? 'ಕಿರೀಟ ಬೇರು ಹಂತದಲ್ಲಿ (ದಿನ 20-22) ಮೊದಲ ನೀರಾವರಿ ನೀಡುವುದು ಅತಿ ಮುಖ್ಯ. ತಡಮಾಡಬೇಡಿ.'
          : language === 'hi'
          ? 'ताज जड़ अवस्था (दिन 20-22) पर पहली सिंचाई अत्यंत आवश्यक है, देरी न करें।'
          : 'Most critical irrigation at Crown Root Initiation (Day 20-22). Do not delay.',
        fertilizerReminder: language === 'kn'
          ? 'ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಿದ ಪೂರ್ಣ ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಹಾಗೂ 1/3 ಸಾರಜನಕ ನೀಡಿ.'
          : language === 'hi'
          ? 'बुआई के समय फास्फोरस व पोटाश की पूरी मात्रा + 1/3 नाइट्रोजन का प्रयोग करें।'
          : 'Full basal dose of P & K + 1/3rd Nitrogen at sowing.',
      },
      {
        stageNumber: 2,
        name: language === 'kn' ? 'ತೆಂಡೆ ಮತ್ತು ಗಿಣ್ಣು ಬೆಳವಣಿಗೆ' : language === 'hi' ? 'कल्ले निकलना एवं गांठ बनना' : 'Tillering & Jointing',
        category: 'Vegetative',
        startDay: 22,
        endDay: 60,
        irrigationReminder: language === 'kn'
          ? 'ತೆಂಡೆ ಹಂತದಲ್ಲಿ (ದಿನ 40-45) ಎರಡನೇ ಮತ್ತು ಗಿಣ್ಣು ಹಂತದಲ್ಲಿ (ದಿನ 60) ಮೂರನೇ ನೀರಾವರಿ ನೀಡಿ.'
          : language === 'hi'
          ? 'कल्ले फूटते समय (दिन 40-45) दूसरी और गांठ बनते समय (दिन 60) तीसरी सिंचाई करें।'
          : 'Second irrigation at tillering (Day 40-45) and third at jointing (Day 60).',
        fertilizerReminder: language === 'kn'
          ? 'ಎರಡನೇ ನೀರಾವರಿಗೆ ಮುನ್ನ ಯೂರಿಯಾದ ಮೊದಲ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ.'
          : language === 'hi'
          ? 'दूसरी सिंचाई से पहले यूरिया की पहली टॉप-ड्रेसिंग करें।'
          : 'Apply first top dressing of Urea before second irrigation.',
      },
      {
        stageNumber: 3,
        name: language === 'kn' ? 'ತೆನೆ ಹೊರಬರುವುದು ಮತ್ತು ಹೂವಾಡುವಿಕೆ' : language === 'hi' ? 'बाली निकलना एवं फूल आना' : 'Heading & Flowering',
        category: 'Flowering/Fruiting',
        startDay: 61,
        endDay: 90,
        irrigationReminder: language === 'kn'
          ? 'ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಶಾಂತ ವಾತಾವರಣವಿರುವಾಗ ನೀರುಣಿಸಿ, ಬೆಳೆ ಮಲಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ.'
          : language === 'hi'
          ? 'फूल आते समय शांत दिनों में हल्की सिंचाई करें ताकि फसल गिरे नहीं।'
          : 'Irrigate at flowering/boot stage on calm days to prevent lodging.',
        fertilizerReminder: language === 'kn'
          ? 'ಕಾಳು ದಪ್ಪವಾಗಲು 13:0:45 ಪೊಟ್ಯಾಸಿಯಮ್ ನೈಟ್ರೇಟ್ ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.'
          : language === 'hi'
          ? 'मोटे दानों के लिए 13:0:45 (पोटेशियम नाइट्रेट) का पर्णीय छिड़काव करें।'
          : 'Foliar spray of 13:0:45 (Potassium Nitrate) to ensure bold grain development.',
      },
      {
        stageNumber: 4,
        name: language === 'kn' ? 'ಕಾಳು ಗಟ್ಟಿಯಾಗುವುದು ಮತ್ತು ಕೊಯ್ಲು' : language === 'hi' ? 'दाना भरना एवं कटाई' : 'Grain Filling & Harvest',
        category: 'Harvest',
        startDay: 91,
        endDay: 120,
        irrigationReminder: language === 'kn'
          ? 'ಕಾಳು ಗಟ್ಟಿಯಾಗಲು ಅಂತಿಮ ಲಘು ನೀರಾವರಿ ನೀಡಿ; ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲು ನಿಲ್ಲಿಸಿ.'
          : language === 'hi'
          ? 'दाना भरते समय अंतिम हल्की सिंचाई करें; कटाई से 10 दिन पहले पानी बंद करें।'
          : 'Terminal light irrigation at dough stage; cease water 10 days before harvest.',
        fertilizerReminder: language === 'kn'
          ? 'ಕಾಳುಗಳಲ್ಲಿ ಶೇ. 12-14 ತೇವಾಂಶವಿದ್ದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಒಣಗಿಸಿ.'
          : language === 'hi'
          ? 'दानों में 12-14% नमी रहने पर कटाई करें और सुखाएं।'
          : 'Harvest when grains resist fingernail denting and dry to 12% moisture.',
      },
    ],
  };
}

function getCottonProfile(displayName: string, language: Language): CropGrowthProfile {
  return {
    crop: displayName,
    emoji: '☁️',
    label: displayName,
    totalDays: 160,
    stages: [
      {
        stageNumber: 1,
        name: language === 'kn' ? 'ಮೊಳಕೆ ಮತ್ತು ಆರಂಭಿಕ ಬೆಳವಣಿಗೆ' : language === 'hi' ? 'अंकुरण एवं प्रारंभिक विकास' : 'Germination & Seedling',
        category: 'Germination',
        startDay: 0,
        endDay: 30,
        irrigationReminder: language === 'kn'
          ? 'ಬೀಜ ಮೊಳಕೆಯೊಡೆಯಲು ಲಘು ನೀರು ನೀಡಿ, ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.'
          : language === 'hi'
          ? 'अंकुरण के लिए हल्की सिंचाई करें, खेत में पानी रुकने न दें।'
          : 'Light irrigations; prevent soil crusting and stagnant water near tap roots.',
        fertilizerReminder: language === 'kn'
          ? 'ಸಾಲುಗಳಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡುವಾಗ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಮೂಲ ಎನ್‌ಪಿಕೆ ನೀಡಿ.'
          : language === 'hi'
          ? 'बुआई के समय कतारों में गोबर की खाद एवं बेसल एनपीके दें।'
          : 'Basal dose of FYM + 25% Nitrogen + 100% Phosphorus and Potash.',
      },
      {
        stageNumber: 2,
        name: language === 'kn' ? 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ಕವಲುಗಳು' : language === 'hi' ? 'वानस्पतिक वृद्धि एवं शाखाएं' : 'Vegetative & Square Formation',
        category: 'Vegetative',
        startDay: 31,
        endDay: 70,
        irrigationReminder: language === 'kn'
          ? 'ಗಿಡಗಳು ಸೊಂಪಾಗಿ ಬೆಳೆಯಲು 10-15 ದಿನಗಳಿಗೊಮ್ಮೆ ನಿಯಮಿತ ನೀರು ಒದಗಿಸಿ.'
          : language === 'hi'
          ? 'पौधों के अच्छे फैलाव के लिए 10-15 दिनों के अंतराल पर सिंचाई करें।'
          : 'Maintain moderate moisture; avoid excessive moisture that causes vegetative rank growth.',
        fertilizerReminder: language === 'kn'
          ? 'ಹೂಮೊಗ್ಗು ಹಂತದಲ್ಲಿ ಯೂರಿಯಾದ ಮೊದಲ ಮೇಲುಗೊಬ್ಬರ ನೀಡಿ ಕಳೆ ತೆಗೆಯಿರಿ.'
          : language === 'hi'
          ? 'कली बनते समय यूरिया की पहली टॉप-ड्रेसिंग करें और निराई करें।'
          : 'First top dressing with Urea (Nitrogen) at square initiation.',
      },
      {
        stageNumber: 3,
        name: language === 'kn' ? 'ಹೂ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ' : language === 'hi' ? 'फूल एवं टिंडे बनना' : 'Flowering & Boll Development',
        category: 'Flowering/Fruiting',
        startDay: 71,
        endDay: 120,
        irrigationReminder: language === 'kn'
          ? 'ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ! ಹೂವು ಮತ್ತು ಕಾಯಿ ಉದುರದಂತೆ ನಿಯಮಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ.'
          : language === 'hi'
          ? 'सबसे संवेदनशील अवस्था! फूल व टिंडे झड़ने से रोकने के लिए नमी बनाए रखें।'
          : 'Most water-sensitive period! Water stress causes square and boll shedding.',
        fertilizerReminder: language === 'kn'
          ? 'ಕಾಯಿ ದೊಡ್ಡದಾಗಲು ಮತ್ತು ಉದುರುವುದು ತಡೆಯಲು ಬೋರಾನ್ ಮತ್ತು ಮೆಗ್ನೀಸಿಯಮ್ ಸಲ್ಫೇಟ್ ಸಿಂಪಡಿಸಿ.'
          : language === 'hi'
          ? 'टिंडों के अच्छे विकास और झड़न रोकने के लिए बोरॉन व मैग्नीशियम सल्फेट का छिड़काव करें।'
          : 'Foliar spray of 1% Magnesium Sulphate + 0.1% Boron to prevent boll dropping.',
      },
      {
        stageNumber: 4,
        name: language === 'kn' ? 'ಕಾಯಿ ಒಡೆಯುವುದು ಮತ್ತು ಹತ್ತಿ ಬಿಡಿಸುವುದು' : language === 'hi' ? 'टिंडे खुलना एवं चुनाई' : 'Boll Bursting & Picking',
        category: 'Harvest',
        startDay: 121,
        endDay: 160,
        irrigationReminder: language === 'kn'
          ? 'ಶೇ. 20 ರಷ್ಟು ಕಾಯಿಗಳು ಒಡೆದ ನಂತರ ನೀರು ನಿಲ್ಲಿಸಿ.'
          : language === 'hi'
          ? '20% टिंडे खुलने के बाद सिंचाई पूरी तरह बंद कर दें।'
          : 'Cease irrigation when ~20% of bolls have burst open.',
        fertilizerReminder: language === 'kn'
          ? 'ಬಿಸಿಲು ಚೆನ್ನಾಗಿರುವಾಗ ಶುಷ್ಕ ಹತ್ತಿ ಬಿಡಿಸಿ, ಎಲೆ ಕಸ ಸೇರದಂತೆ ಕಾಳಜಿ ವಹಿಸಿ.'
          : language === 'hi'
          ? 'धूप वाले दिन सूखी कपास की चुनाई करें, पत्तियां या कचरा न मिलने दें।'
          : 'Pick clean, mature seed cotton after morning dew evaporates.',
      },
    ],
  };
}

function getGenericCropProfile(
  displayName: string,
  emoji: string,
  t: Copy,
  language: Language
): CropGrowthProfile {
  return {
    crop: displayName,
    emoji,
    label: displayName,
    totalDays: 110,
    stages: [
      {
        stageNumber: 1,
        name: `${displayName} - ${t.stageGermination}`,
        category: 'Germination',
        startDay: 0,
        endDay: 15,
        irrigationReminder: language === 'kn'
          ? `${displayName} ಬೀಜಗಳು ಸರಾಗವಾಗಿ ಮೊಳಕೆಯೊಡೆಯಲು ಮಣ್ಣಿನಲ್ಲಿ ಸಮತೋಲಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ. ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.`
          : language === 'hi'
          ? `${displayName} के स्वस्थ अंकुरण के लिए खेत में हल्की व समान नमी बनाए रखें। जलभराव से बचें।`
          : `Maintain light and uniform seedbed moisture for ${displayName} seed emergence. Avoid soil crusting and standing water.`,
        fertilizerReminder: language === 'kn'
          ? 'ಆರಂಭಿಕ ಬೇರುಗಳ ಬಲವರ್ಧನೆಗಾಗಿ ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಚೆನ್ನಾಗಿ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಅಥವಾ ಆರಂಭಿಕ ಎನ್‌ಪಿಕೆ/ಡಿಎಪಿ ನೀಡಿ.'
          : language === 'hi'
          ? 'मजबूत जड़ प्रणाली के लिए बुआई के समय अच्छी सड़ी गोबर खाद या बेसल एनपीके/डीएपी का प्रयोग करें।'
          : 'Apply well-decomposed organic manure or balanced starter NPK/DAP to stimulate strong seedling root initiation.',
      },
      {
        stageNumber: 2,
        name: `${displayName} - ${t.stageVegetative}`,
        category: 'Vegetative',
        startDay: 16,
        endDay: 50,
        irrigationReminder: language === 'kn'
          ? 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆಯ ಸಮಯದಲ್ಲಿ ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಗಮನಿಸಿ ನಿಯಮಿತವಾಗಿ ನೀರುಣಿಸಿ.'
          : language === 'hi'
          ? 'सक्रिय वानस्पतिक वृद्धि के समय आवश्यकतानुसार समय पर गहरी सिंचाई करें।'
          : 'Provide consistent irrigations matching soil moisture and weather conditions during peak vegetative foliage expansion.',
        fertilizerReminder: language === 'kn'
          ? 'ಗಿಡಗಳ ಸಮೃದ್ಧ ಬೆಳವಣಿಗೆಗೆ ಸಾರಜನಕಯುಕ್ತ ಮೇಲುಗೊಬ್ಬರ ಅಥವಾ ದ್ರವರೂಪದ ಜೀವಾವೃತ/ಪಂಚಗವ್ಯ ನೀಡಿ.'
          : language === 'hi'
          ? 'अच्छे वानस्पतिक फैलाव के लिए नाइट्रोजन युक्त खाद (यूरिया) या तरल जीवामृत का छिड़काव/प्रयोग करें।'
          : 'Apply nitrogenous top dressing or organic liquid bio-nutrients (Jeevamrutha) to foster vigorous shoot and branch growth.',
      },
      {
        stageNumber: 3,
        name: `${displayName} - ${t.stageFlowering}`,
        category: 'Flowering/Fruiting',
        startDay: 51,
        endDay: 85,
        irrigationReminder: language === 'kn'
          ? 'ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ! ಹೂವು ಮತ್ತು ಕಾಯಿ ಉದುರುವುದನ್ನು ತಡೆಯಲು ನಿಯಮಿತ ನೀರಾವರಿ ನೀಡಿ ತೇವಾಂಶದ ಕೊರತೆಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.'
          : language === 'hi'
          ? 'अति संवेदनशील अवस्था! फूल व फल गिरने से रोकने के लिए जड़ क्षेत्र में निरंतर नमी बनाए रखें।'
          : 'Most moisture-critical phase: never subject the root zone to moisture stress during flowering and fruit/seed filling.',
        fertilizerReminder: language === 'kn'
          ? 'ಉತ್ತಮ ಪರಾಗಸ್ಪರ್ಶ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವಿಕೆಗಾಗಿ ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳ (ಬೋರಾನ್/ಜಿಂಕ್) ಸಿಂಪಡಣೆ ಮಾಡಿ.'
          : language === 'hi'
          ? 'उत्तम फलन और दाना/फल भराव के लिए घुलनशील पोटाश एवं सूक्ष्म पोषक तत्वों (बोरॉन/जिंक) का पर्णीय छिड़काव करें।'
          : 'Apply foliar spray of Potassium and chelated micronutrients (Boron/Zinc) to prevent flower drop and maximize grain/fruit density.',
      },
      {
        stageNumber: 4,
        name: `${displayName} - ${t.stageHarvest}`,
        category: 'Harvest',
        startDay: 86,
        endDay: 110,
        irrigationReminder: language === 'kn'
          ? 'ಬೆಳೆ ಸಮವಾಗಿ ಪಕ್ವವಾಗಲು ಕೊಯ್ಲಿಗೆ 10-14 ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ನೀರುಣಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ.'
          : language === 'hi'
          ? 'फसल को एक समान पकाने और सूखने के लिए कटाई से 10-14 दिन पूर्व सिंचाई रोक दें।'
          : 'Gradually withdraw irrigation 10-14 days prior to harvest to promote uniform ripening, drying, and easy harvesting.',
        fertilizerReminder: language === 'kn'
          ? 'ಎಲ್ಲಾ ರಸಗೊಬ್ಬರಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಒಣ ಹವಾಮಾನದಲ್ಲಿ ಪಕ್ವವಾದ ಬೆಳೆಯನ್ನು ಕೊಯ್ಲು ಮಾಡಿ ಸೂಕ್ತವಾಗಿ ಒಣಗಿಸಿ.'
          : language === 'hi'
          ? 'सभी रासायनिक/उर्वरक प्रयोग बंद करें। साफ व शुष्क मौसम में परिपक्व फसल की कटाई कर सुरक्षित भंडारण करें।'
          : 'Cease all fertilizer applications. Harvest at peak biological maturity during clear, sunny weather and dry safely.',
      },
    ],
  };
}

function computeCropProfile(
  rawCropName: string,
  t: Copy,
  language: Language
): CropGrowthProfile {
  const cleanName = rawCropName.trim();
  const lower = cleanName.toLowerCase();
  const displayName = cleanName || (language === 'kn' ? 'ಬೆಳೆ' : language === 'hi' ? 'फसल' : 'Crop');

  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('ಭತ್ತ') || lower.includes('धान')) {
    return getPaddyProfile(displayName, language);
  }
  if (lower.includes('wheat') || lower.includes('ಗೋಧಿ') || lower.includes('गेहूं')) {
    return getWheatProfile(displayName, language);
  }
  if (lower.includes('cotton') || lower.includes('ಹತ್ತಿ') || lower.includes('कपास')) {
    return getCottonProfile(displayName, language);
  }

  const emoji = getCropEmoji(displayName);
  return getGenericCropProfile(displayName, emoji, t, language);
}

function getStageCategoryLabel(category: StageCategory, t: Copy): string {
  switch (category) {
    case 'Germination':
      return t.stageGermination;
    case 'Vegetative':
      return t.stageVegetative;
    case 'Flowering/Fruiting':
      return t.stageFlowering;
    case 'Harvest':
      return t.stageHarvest;
    default:
      return category;
  }
}

export function CropStageCalendar({
  db,
  workspaceId,
  lg = false,
  t: propT,
  language: propLanguage,
}: {
  db: SQLite.SQLiteDatabase | null;
  workspaceId: string;
  lg?: boolean;
  t?: Copy;
  language?: Language;
}) {
  const activeLangContext = useActiveLanguage();
  const t = propT || activeLangContext.t;
  const language = propLanguage || activeLangContext.language || 'en';

  const [cropName, setCropName] = useState<string>('Paddy');
  const [sowingDate, setSowingDate] = useState<string>(getTodayIso());
  const [savedSchedules, setSavedSchedules] = useState<CropSchedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadSchedules = useCallback(async () => {
    if (!db) return;
    try {
      const list = await listCropSchedules(db, workspaceId);
      setSavedSchedules(list);
      if (list.length > 0 && !activeScheduleId) {
        const first = list[0];
        setActiveScheduleId(first.id);
        setCropName(first.cropName);
        setSowingDate(first.sowingDate);
      }
    } catch (err) {
      console.warn('Could not load crop schedules:', err);
    }
  }, [db, workspaceId, activeScheduleId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!db) return;
      try {
        const list = await listCropSchedules(db, workspaceId);
        if (!alive) return;
        setSavedSchedules(list);
        if (list.length > 0 && !activeScheduleId) {
          const first = list[0];
          setActiveScheduleId(first.id);
          setCropName(first.cropName);
          setSowingDate(first.sowingDate);
        }
      } catch (err) {
        console.warn('Could not load crop schedules on init:', err);
      }
    })();
    return () => { alive = false; };
  }, [db, workspaceId, activeScheduleId]);

  const handleSelectSaved = (schedule: CropSchedule) => {
    setActiveScheduleId(schedule.id);
    setCropName(schedule.cropName);
    setSowingDate(schedule.sowingDate);
  };

  const handleNewPlan = () => {
    setActiveScheduleId(null);
    setCropName('');
    setSowingDate(getTodayIso());
  };

  const handleSaveSchedule = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      const cleanName = cropName.trim() || 'Custom Crop';
      const cleanDate = sowingDate.trim() || getTodayIso();
      const saved = await addCropSchedule(
        db,
        {
          cropName: cleanName,
          sowingDate: cleanDate,
        },
        workspaceId
      );
      setActiveScheduleId(saved.id);
      await loadSchedules();
    } catch (e) {
      console.warn('Failed to save schedule:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string, name: string) => {
    const doDelete = async () => {
      if (!db) return;
      try {
        await deleteCropSchedule(db, id, workspaceId);
        if (activeScheduleId === id) {
          setActiveScheduleId(null);
        }
        await loadSchedules();
      } catch (e) {
        console.warn('Failed to delete schedule:', e);
      }
    };

    const confirmMsg = t.deleteScheduleConfirm.replace('{name}', name);
    Alert.alert(
      t.deleteScheduleTitle,
      confirmMsg,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const handleQuickDateOffset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSowingDate(`${y}-${m}-${day}`);
    setActiveScheduleId(null);
  };

  const profile = useMemo(
    () => computeCropProfile(cropName, t, language),
    [cropName, t, language]
  );

  const daysElapsed = getDaysSinceSowing(sowingDate);
  const sowingParsed = parseLocalDate(sowingDate);

  let currentStageIndex = -1;
  if (daysElapsed >= 0) {
    currentStageIndex = profile.stages.findIndex(
      s => daysElapsed >= s.startDay && daysElapsed <= s.endDay
    );
    if (currentStageIndex === -1 && daysElapsed > profile.totalDays) {
      currentStageIndex = profile.stages.length - 1;
    }
  }

  const currentStage = currentStageIndex >= 0 ? profile.stages[currentStageIndex] : null;

  return (
    <View style={[shared.tipCard, lg && shared.tipCardLg, styles.container]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={20} color={GREEN} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={[shared.tipTitle, lg && shared.tipTitleLg, { color: INK, flexWrap: 'wrap' }]}>
              {t.cropStageCalendarTitle}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t.cropStageCalendarSubtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Saved Schedules Row */}
      {savedSchedules.length > 0 && (
        <View style={styles.savedSection}>
          <Text style={styles.subheading}>{t.trackedInWorkspace}</Text>
          <View style={styles.savedPillsRow}>
            {savedSchedules.map(sch => {
              const isSelected = activeScheduleId === sch.id;
              const schEmoji = getCropEmoji(sch.cropName);
              const schElapsed = getDaysSinceSowing(sch.sowingDate);
              return (
                <View
                  key={sch.id}
                  style={[
                    styles.savedPill,
                    isSelected && styles.savedPillActive,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleSelectSaved(sch)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 }}
                  >
                    <Text style={{ fontSize: 13 }}>{schEmoji}</Text>
                    <Text
                      style={[
                        styles.savedPillText,
                        isSelected && styles.savedPillTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {sch.cropName} (Day {Math.max(0, schElapsed)})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSchedule(sch.id, sch.cropName)}
                    style={styles.deletePillBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={15}
                      color={isSelected ? '#FFFFFF' : DANGER}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity
              onPress={handleNewPlan}
              style={[styles.savedPill, styles.newPlanPill]}
            >
              <Ionicons name="add" size={14} color={GREEN} />
              <Text style={{ fontSize: 12, color: GREEN, fontWeight: '700' }}>
                {t.newCropPlan}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Crop Input Field */}
      <View style={styles.cropInputSection}>
        <FormField
          label={t.cropInputLabel}
          value={cropName}
          onChangeText={text => {
            setCropName(text);
            setActiveScheduleId(null);
          }}
          placeholder={t.cropInputPlaceholder}
          maxLength={60}
          enableVoice={true}
          language={language}
        />
      </View>

      {/* Sowing Date Input & Quick Offsets */}
      <View style={styles.dateSection}>
        <View style={styles.dateInputCol}>
          <Text style={styles.subheading}>{t.sowingDateLabel}:</Text>
          <TextInput
            value={sowingDate}
            onChangeText={v => {
              setSowingDate(v);
              setActiveScheduleId(null);
            }}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            maxLength={10}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.quickOffsetsContainer}>
          <Text style={[styles.subheading, { marginBottom: 6 }]}>{t.quickPick}</Text>
          <View style={styles.quickOffsetsRow}>
            {[
              { label: t.today || 'Today', days: 0 },
              { label: '-7d', days: 7 },
              { label: '-15d', days: 15 },
              { label: '-30d', days: 30 },
            ].map(offset => (
              <TouchableOpacity
                key={offset.label}
                onPress={() => handleQuickDateOffset(offset.days)}
                style={styles.offsetBtn}
              >
                <Text style={styles.offsetBtnText}>{offset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Overview Progress Banner */}
      <View style={styles.progressBanner}>
        <View style={styles.progressBannerHeader}>
          <View style={styles.bannerCropTitleCol}>
            <Text style={styles.bannerCropTitle} numberOfLines={2}>
              {profile.emoji} {profile.label} {t.growthSchedule}
            </Text>
            <Text style={styles.bannerDaysText}>
              {daysElapsed < 0
                ? `${t.sowingInDays} ${Math.abs(daysElapsed)}`
                : daysElapsed > profile.totalDays
                ? `${t.cropMatured} (${daysElapsed} ${t.daysGrowth})`
                : `Day ${daysElapsed} / ${profile.totalDays} ${t.daysGrowth}`}
            </Text>
          </View>
          {currentStage && (
            <View style={styles.activeStageBadge}>
              <Text style={styles.activeStageBadgeText} numberOfLines={1}>
                ● {getStageCategoryLabel(currentStage.category, t)}
              </Text>
            </View>
          )}
        </View>
        {/* Progress bar line */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(
                  100,
                  Math.max(0, Math.round((daysElapsed / profile.totalDays) * 100))
                )}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* 4-Stage Timeline Stepper */}
      <View style={styles.timelineContainer}>
        {profile.stages.map((stage, idx) => {
          const startDate = addDays(sowingParsed, stage.startDay);
          const endDate = addDays(sowingParsed, stage.endDay);
          const isActive = daysElapsed >= stage.startDay && daysElapsed <= stage.endDay;
          const isCompleted = daysElapsed > stage.endDay;
          const isUpcoming = daysElapsed < stage.startDay;
          const isLast = idx === profile.stages.length - 1;

          return (
            <View key={stage.stageNumber} style={styles.stageStepRow}>
              {/* Stepper left indicator + line */}
              <View style={styles.stepperIndicatorCol}>
                <View
                  style={[
                    styles.stepperCircle,
                    isCompleted && styles.stepperCircleCompleted,
                    isActive && styles.stepperCircleActive,
                    isUpcoming && styles.stepperCircleUpcoming,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={GREEN} />
                  ) : (
                    <Text
                      style={[
                        styles.stepperNumber,
                        isActive && styles.stepperNumberActive,
                        isCompleted && styles.stepperNumberCompleted,
                      ]}
                    >
                      {stage.stageNumber}
                    </Text>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepperLine,
                      isCompleted && styles.stepperLineCompleted,
                    ]}
                  />
                )}
              </View>

              {/* Stage Content Card */}
              <View
                style={[
                  styles.stageContentCard,
                  isActive && styles.stageContentCardActive,
                ]}
              >
                {/* Header row inside stage */}
                <View style={styles.stageHeaderRow}>
                  <View style={styles.stageHeaderTitleCol}>
                    <Text style={[styles.stageName, isActive && styles.stageNameActive]}>
                      {t.stageLabel} {stage.stageNumber}: {stage.name}
                    </Text>
                    <Text style={styles.stageDatesText}>
                      Days {stage.startDay} – {stage.endDay} · {formatDateShort(startDate, language)} – {formatDateShort(endDate, language)}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View style={styles.badgeContainer}>
                    {isActive && (
                      <View style={styles.badgeActive}>
                        <Text style={styles.badgeActiveText}>{t.activeNow}</Text>
                      </View>
                    )}
                    {isCompleted && (
                      <View style={styles.badgeCompleted}>
                        <Text style={styles.badgeCompletedText}>{t.stageCompleted}</Text>
                      </View>
                    )}
                    {isUpcoming && (
                      <View style={styles.badgeUpcoming}>
                        <Text style={styles.badgeUpcomingText}>{t.stageUpcoming}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Agronomic Reminders */}
                <View style={styles.remindersBox}>
                  <View style={styles.reminderRow}>
                    <Ionicons
                      name="water-outline"
                      size={16}
                      color="#0288D1"
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                      <Text style={styles.reminderLabel}>{t.irrigation}</Text>
                      <Text style={styles.reminderText}>{stage.irrigationReminder}</Text>
                    </View>
                  </View>
                  <View style={[styles.reminderRow, { marginTop: 8 }]}>
                    <MaterialCommunityIcons
                      name="sprout-outline"
                      size={16}
                      color={GREEN}
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                      <Text style={styles.reminderLabel}>{t.fertilizerNutrition}</Text>
                      <Text style={styles.reminderText}>{stage.fertilizerReminder}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Save / Status Action */}
      <View style={styles.actionSection}>
        {activeScheduleId ? (
          <View style={styles.savedNoticeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <Ionicons name="checkmark-circle" size={16} color={GREEN} />
              <Text style={styles.savedNoticeText} numberOfLines={1}>
                {t.trackingActive}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                const current = savedSchedules.find(s => s.id === activeScheduleId);
                if (current) {
                  handleDeleteSchedule(current.id, current.cropName);
                }
              }}
              style={styles.deleteScheduleBtn}
            >
              <Text style={styles.deleteScheduleBtnText}>{t.deleteSchedule}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleSaveSchedule}
            disabled={isSaving}
            style={[shared.primaryButton, styles.saveButton]}
          >
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={shared.primaryButtonText}>
              {isSaving ? t.savingSchedule : `${t.saveScheduleToWorkspace}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E8DD',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginVertical: 14,
  },
  headerRow: {
    marginBottom: 14,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  subheading: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    marginBottom: 8,
  },
  savedSection: {
    backgroundColor: '#F7FAF7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2ECE4',
  },
  savedPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE0D2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    maxWidth: '100%',
  },
  savedPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  savedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    flexShrink: 1,
  },
  savedPillTextActive: {
    color: '#FFFFFF',
  },
  deletePillBtn: {
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  newPlanPill: {
    backgroundColor: LIGHT_GREEN,
    borderColor: '#BFE0C7',
    borderStyle: 'dashed',
  },
  cropInputSection: {
    marginBottom: 10,
  },
  dateSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  dateInputCol: {
    flex: 1,
    minWidth: 150,
    flexShrink: 1,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CDE0D2',
    backgroundColor: '#FAFDFB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: INK,
    fontWeight: '600',
  },
  quickOffsetsContainer: {
    minWidth: 160,
    flexShrink: 1,
  },
  quickOffsetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  offsetBtn: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E2CF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  offsetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },
  progressBanner: {
    backgroundColor: '#F0F8F2',
    borderWidth: 1,
    borderColor: '#D5EBD9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  progressBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  bannerCropTitleCol: {
    flex: 1,
    minWidth: 140,
    flexShrink: 1,
  },
  bannerCropTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  bannerDaysText: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  activeStageBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  activeStageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#D7ECD9',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 3,
  },
  timelineContainer: {
    marginBottom: 10,
  },
  stageStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepperIndicatorCol: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  stepperCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0DDD3',
    backgroundColor: '#FFFFFF',
  },
  stepperCircleActive: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },
  stepperCircleCompleted: {
    borderColor: GREEN,
    backgroundColor: LIGHT_GREEN,
  },
  stepperCircleUpcoming: {
    borderColor: '#DDE5DF',
    backgroundColor: '#F7FAF7',
  },
  stepperNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
  },
  stepperNumberActive: {
    color: '#FFFFFF',
  },
  stepperNumberCompleted: {
    color: GREEN,
  },
  stepperLine: {
    width: 2,
    flex: 1,
    minHeight: 45,
    backgroundColor: '#E0EAE2',
    marginTop: 4,
  },
  stepperLineCompleted: {
    backgroundColor: '#A6D5B1',
  },
  stageContentCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FAFDFB',
    borderWidth: 1,
    borderColor: '#E1ECE3',
    borderRadius: 12,
    padding: 12,
  },
  stageContentCardActive: {
    backgroundColor: '#F2F9F3',
    borderColor: '#8BC99A',
    borderWidth: 1.5,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  stageHeaderTitleCol: {
    flex: 1,
    minWidth: 120,
    flexShrink: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  stageNameActive: {
    color: GREEN,
  },
  stageDatesText: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },
  badgeContainer: {
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeActiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeCompleted: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeCompletedText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeUpcoming: {
    backgroundColor: '#EFF3F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
  },
  badgeUpcomingText: {
    color: '#7C8A80',
    fontSize: 10,
    fontWeight: '600',
  },
  remindersBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EBF2ED',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reminderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
  },
  reminderText: {
    fontSize: 12,
    color: INK,
    lineHeight: 16,
    marginTop: 1,
  },
  actionSection: {
    marginTop: 4,
  },
  savedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  savedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
    flexShrink: 1,
  },
  deleteScheduleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  deleteScheduleBtnText: {
    fontSize: 12,
    color: DANGER,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
});
