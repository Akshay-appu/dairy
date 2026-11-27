import { Language } from '../i18n/copy';

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

export type CropIconName =
  | 'barley'
  | 'seed-outline'
  | 'corn'
  | 'leaf'
  | 'flower-outline'
  | 'sprout-outline'
  | 'food-apple-outline'
  | 'chili-mild'
  | 'spa-outline'
  | 'peanut-outline'
  | 'palm-tree'
  | 'fruit-cherries'
  | 'tree-outline';

export interface CropGrowthProfile {
  crop: string;
  iconName: CropIconName;
  label: string;
  defaultTotalDays: number;
  totalDays: number;
  stages: StageDefinition[];
}

export interface PopularCropPreset {
  key: string;
  iconName: CropIconName;
  defaultDays: number;
  labels: Record<Language, string>;
}

export const POPULAR_CROP_PRESETS: PopularCropPreset[] = [
  { key: 'paddy', iconName: 'barley', defaultDays: 130, labels: { en: 'Paddy', kn: 'ಭತ್ತ', hi: 'धान' } },
  { key: 'ragi', iconName: 'seed-outline', defaultDays: 110, labels: { en: 'Ragi', kn: 'ರಾಗಿ', hi: 'रागी' } },
  { key: 'maize', iconName: 'corn', defaultDays: 105, labels: { en: 'Maize', kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' } },
  { key: 'wheat', iconName: 'barley', defaultDays: 120, labels: { en: 'Wheat', kn: 'ಗೋಧಿ', hi: 'गेहूं' } },
  { key: 'cotton', iconName: 'flower-outline', defaultDays: 160, labels: { en: 'Cotton', kn: 'ಹತ್ತಿ', hi: 'कपास' } },
  { key: 'sugarcane', iconName: 'sprout-outline', defaultDays: 330, labels: { en: 'Sugarcane', kn: 'ಕಬ್ಬು', hi: 'गन्ना' } },
  { key: 'tomato', iconName: 'food-apple-outline', defaultDays: 110, labels: { en: 'Tomato', kn: 'ಟೊಮ್ಯಾಟೊ', hi: 'टमाटर' } },
  { key: 'chilli', iconName: 'chili-mild', defaultDays: 150, labels: { en: 'Chilli', kn: 'ಮೆಣಸಿನಕಾಯಿ', hi: 'मिर्च' } },
  { key: 'onion', iconName: 'spa-outline', defaultDays: 125, labels: { en: 'Onion', kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज' } },
  { key: 'groundnut', iconName: 'peanut-outline', defaultDays: 115, labels: { en: 'Groundnut', kn: 'ಶೇಂಗಾ', hi: 'मूंगफली' } },
  { key: 'arecanut', iconName: 'palm-tree', defaultDays: 180, labels: { en: 'Arecanut / Coconut', kn: 'ಅಡಿಕೆ / ತೆಂಗು', hi: 'सुपारी / नारियल' } },
  { key: 'banana', iconName: 'fruit-cherries', defaultDays: 300, labels: { en: 'Banana', kn: 'ಬಾಳೆ', hi: 'केला' } },
];

type LocalizedStageTemplate = {
  stageNumber: 1 | 2 | 3 | 4;
  category: StageCategory;
  endDay: number;
  name: Record<Language, string>;
  irrigation: Record<Language, string>;
  nutrition: Record<Language, string>;
};

type CropTemplate = {
  iconName: CropIconName;
  defaultTotalDays: number;
  stages: [
    LocalizedStageTemplate,
    LocalizedStageTemplate,
    LocalizedStageTemplate,
    LocalizedStageTemplate,
  ];
};

const CROP_TEMPLATES: Record<string, CropTemplate> = {
  paddy: {
    iconName: 'barley',
    defaultTotalDays: 130,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 22,
        name: {
          en: 'Nursery & Transplanting',
          kn: 'ಸಸಿ ಮಡಿ ಮತ್ತು ನಾಟಿ',
          hi: 'नर्सरी एवं रोपाई',
        },
        irrigation: {
          en: 'Maintain shallow water (2–3 cm) in nursery and puddled main field. Prevent drying or seedling submergence.',
          kn: 'ಸಸಿ ಮಡಿ ಮತ್ತು ನಾಟಿ ಮಾಡಿದ ಹೊಲದಲ್ಲಿ 2–3 ಸೆಂ.ಮೀ ತೆಳುವಾದ ನೀರಿನ ಮಟ್ಟ ಕಾಪಾಡಿ. ಸಸಿ ಒಣಗದಂತೆ ಅಥವಾ ಮುಳುಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'नर्सरी व रोपाई किए गए खेत में 2–3 सेमी उथला पानी बनाए रखें। सूखने या पौध डूबने से बचाएं।',
        },
        nutrition: {
          en: 'Treat seeds/roots with BSJDK Beejamrutha and enrich basal bed with compost + Zinc Sulphate (25 kg/ha).',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜ/ಬೇರು ಉಪಚಾರ ಮಾಡಿ, ನಾಟಿಯ ವೇಳೆ ಸಾವಯವ ಗೊಬ್ಬರ ಹಾಗೂ ಸತುವಿನ ಸಲ್ಫೇಟ್ (25 ಕೆಜಿ/ಹೆ.) ನೀಡಿ.',
          hi: 'BSJDK बीजामृत से बीज/जड़ उपचार करें तथा रोपाई के समय कम्पोस्ट व जिंक सल्फेट (25 किग्रा/हे.) का प्रयोग करें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 58,
        name: {
          en: 'Active Tillering (BSJDK Phase)',
          kn: 'ಸಕ್ರಿಯ ತೆಂಡೆ ಹೊಡೆಯುವ ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'सक्रिय कल्ले निकलना (BSJDK चरण)',
        },
        irrigation: {
          en: 'Adopt Alternate Wetting & Drying (AWD) at 3–5 cm depth to stimulate healthy root aeration and strong tillers.',
          kn: 'ಆರೋಗ್ಯಕರ ಬೇರು ಮತ್ತು ಹೆಚ್ಚು ತೆಂಡೆಗಳಿಗಾಗಿ 3–5 ಸೆಂ.ಮೀ ಪರ್ಯಾಯ ಒಣಗಿಸುವ-ನೀರುಣಿಸುವ (AWD) ವಿಧಾನ ಅನುಸರಿಸಿ.',
          hi: 'मजबूत जड़ों और अधिक कल्लों के लिए 3–5 सेमी स्तर पर बारी-बारी से गीला और सूखा (AWD) सिंचाई करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 200 L/acre Bhoomishakti JeevaDhara liquid bio-culture with irrigation + 100 kg neem-coated Ghanajeevamrutha for dense tillering.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ದಟ್ಟ ತೆಂಡೆ ಹೊಡೆಯಲು ನೀರಾವರಿಯೊಂದಿಗೆ ಎಕರೆಗೆ 200 ಲೀ. ಭೂಮಿಶಕ್ತಿ ಜೀವಧಾರಾ ದ್ರವ ಹಾಗೂ 100 ಕೆಜಿ ಘನಜೀವಾಮೃತ/ಬೇವಿನ ಹಿಂಡಿ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: भरपूर कल्लों के लिए सिंचाई के साथ 200 लीटर/एकड़ भूमि शक्ति जीवधारा तरल व 100 किग्रा घनजीवामृत/नीम खली का प्रयोग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 96,
        name: {
          en: 'Panicle Initiation & Flowering',
          kn: 'ತೆನೆ ಒಡೆಯುವಿಕೆ ಮತ್ತು ಹೂವಾಡುವ ಹಂತ',
          hi: 'बाली निकलना एवं फूल आना',
        },
        irrigation: {
          en: 'Most critical moisture phase! Keep 5 cm continuous water from booting through milky grain stage.',
          kn: 'ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಹಂತ! ಹೊಡೆ ಬರುವುದರಿಂದ ಹಾಲು ತುಂಬುವ ಹಂತದವರೆಗೆ ನಿರಂತರ 5 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'अति संवेदनशील अवस्था! बाली निकलने से दूधिया दाने तक खेत में लगातार 5 सेमी पानी बनाए रखें।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK JeevaDhara diluted (1:10) + Potash / wood-ash extract for bold grain filling and reduced chaffiness.',
          kn: 'ಕಾಳು ಗಟ್ಟಿಯಾಗಿ ತುಂಬಿಕೊಳ್ಳಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ (1:10) ಸಿಂಪಡಣೆ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಪೋಷಣೆ ನೀಡಿ.',
          hi: 'दानों के पूरे भराव और खाली दाने रोकने के लिए BSJDK जीवधारा (1:10) व पोटाश का पर्णीय छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 130,
        name: {
          en: 'Grain Ripening & Harvest',
          kn: 'ಕಾಳು ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'दाना पकना एवं कटाई',
        },
        irrigation: {
          en: 'Drain standing water completely 10–14 days before harvest for uniform ripening and firm field soil.',
          kn: 'ಬೆಳೆ ಸಮವಾಗಿ ಪಕ್ವವಾಗಲು ಕೊಯ್ಲಿಗೆ 10–14 ದಿನಗಳ ಮೊದಲು ಹೊಲದಿಂದ ನೀರನ್ನು ಸಂಪೂರ್ಣ ಬಸಿದುಬಿಡಿ.',
          hi: 'फसल एक समान पकने के लिए कटाई से 10–14 दिन पहले खेत से पानी पूरी तरह निकाल दें।',
        },
        nutrition: {
          en: 'Stop all nutrient inputs. Harvest when 85–90% of grains on panicles turn golden yellow and dry to 13% moisture.',
          kn: 'ಎಲ್ಲಾ ಗೊಬ್ಬರಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಶೇ. 85–90 ತೆನೆಗಳು ಬಂಗಾರದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಒಣಗಿಸಿ.',
          hi: 'सभी खाद/पोषण बंद करें। 85–90% बालियां सुनहरी होने पर कटाई कर सुरक्षित सुखाएं।',
        },
      },
    ],
  },
  ragi: {
    iconName: 'seed-outline',
    defaultTotalDays: 110,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 20,
        name: {
          en: 'Seedling & Early Establishment',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಸಸಿ ಸ್ಥಾಪನೆ',
          hi: 'अंकुरण एवं पौध स्थापना',
        },
        irrigation: {
          en: 'Give light life-saving irrigation after sowing/transplanting; avoid water stagnation in root zone.',
          kn: 'ಬಿತ್ತನೆ/ನಾಟಿಯ ನಂತರ ಲಘು ನೀರು ನೀಡಿ; ಬೇರುಗಳ ಬಳಿ ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.',
          hi: 'बुआई/रोपाई के बाद हल्की सिंचाई दें; जड़ों में जलभराव न होने दें।',
        },
        nutrition: {
          en: 'Treat seed with BSJDK Beejamrutha + Azospirillum; mix well-decomposed FYM into seedbed.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತ ಮತ್ತು ಅಜೋಸ್ಪೈರಿಲಮ್‌ನಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ, ಮಣ್ಣಿಗೆ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಸೇರಿಸಿ.',
          hi: 'BSJDK बीजामृत व एजोस्पिरिलम से बीज उपचार करें और अच्छी सड़ी गोबर खाद मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 50,
        name: {
          en: 'Tillering & Intercultivation (BSJDK)',
          kn: 'ತೆಂಡೆ ಹಂತ ಮತ್ತು ಅಂತರ ಬೇಸಾಯ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'कल्ले निकलना एवं निराई (BSJDK)',
        },
        irrigation: {
          en: 'Ragi tolerates dry spells well; irrigate only if dry spell exceeds 12–15 days on red soils.',
          kn: 'ರಾಗಿ ಒಣ ಹವೆಯನ್ನು ತಡೆದುಕೊಳ್ಳುತ್ತದೆ; ಕೆಂಪು ಮಣ್ಣಿನಲ್ಲಿ 12–15 ದಿನ ಮಳೆ ಇಲ್ಲದಿದ್ದರೆ ಮಾತ್ರ ನೀರು ನೀಡಿ.',
          hi: 'रागी कम पानी सहन कर लेती है; लाल मिट्टी में 12–15 दिन सूखा रहने पर ही सिंचाई करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Apply BSJDK JeevaDhara root drench (150–200 L/acre) after intercultivation & weeding + vermicompost/Ghanajeevamrutha along rows.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಎಡೆಕುಂಟೆ/ಕಳೆ ತೆಗೆದ ನಂತರ ಸಾಲುಗಳಲ್ಲಿ ಎಕರೆಗೆ 150–200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಮತ್ತು ಎರೆಹುಳು/ಘನಜೀವಾಮೃತ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: निराई-गुड़ाई के बाद कतारों में 150–200 लीटर/एकड़ BSJDK जीवधारा सिंचन व केंचुआ खाद/घनजीवामृत दें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 85,
        name: {
          en: 'Earhead Emergence & Flowering',
          kn: 'ತೆನೆ ಹೊರಬರುವಿಕೆ ಮತ್ತು ಹೂವಾಡುವ ಹಂತ',
          hi: 'बालियां निकलना एवं फूल आना',
        },
        irrigation: {
          en: 'Critical moisture stage during earhead emergence and grain set; irrigate immediately if soil cracks.',
          kn: 'ತೆನೆ ಬರುವಾಗ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವಾಗ ತೇವಾಂಶ ಅತ್ಯಗತ್ಯ; ಮಣ್ಣು ಒಣಗಿದರೆ ತಕ್ಷಣ ನೀರುಣಿಸಿ.',
          hi: 'बाली निकलते और दाना बनते समय नमी ज़रूरी है; मिट्टी सूखने पर तुरंत सिंचाई करें।',
        },
        nutrition: {
          en: 'Spray diluted BSJDK JeevaDhara or buttermilk/cow-urine bio-tonic to boost finger length and grain weight.',
          kn: 'ತೆನೆ ಬೆರಳುಗಳು ಉದ್ದವಾಗಿ ಕಾಳು ದಪ್ಪವಾಗಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಅಥವಾ ಮಜ್ಜಿಗೆ-ಗೋಮೂತ್ರ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ.',
          hi: 'लंबी बालियों और भारी दानों के लिए पतला BSJDK जीवधारा या छाछ-गोमूत्र जैव टॉनिक छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 110,
        name: {
          en: 'Grain Hardening & Harvest',
          kn: 'ಕಾಳು ಗಟ್ಟಿಯಾಗುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'दाना सख्त होना एवं कटाई',
        },
        irrigation: {
          en: 'Stop irrigation 12 days prior to harvest so earheads dry evenly without lodging.',
          kn: 'ತೆನೆಗಳು ಸಮವಾಗಿ ಒಣಗಲು ಕೊಯ್ಲಿಗೆ 12 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'बालियां समान रूप से सूखने के लिए कटाई से 12 दिन पहले सिंचाई रोक दें।',
        },
        nutrition: {
          en: 'Cut brown mature earheads first, then harvest straw cleanly for livestock fodder.',
          kn: 'ಪಕ್ವವಾದ ಕಂದು ತೆನೆಗಳನ್ನು ಕತ್ತರಿಸಿ, ನಂತರ ಜಾನುವಾರು ಮೇವಿಗಾಗಿ ಹುಲ್ಲನ್ನು ಕೊಯ್ಲು ಮಾಡಿ.',
          hi: 'पकी हुई भूरी बालियों की कटाई करें और चारे के लिए भूसा सुरक्षित रखें।',
        },
      },
    ],
  },
  maize: {
    iconName: 'corn',
    defaultTotalDays: 105,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 18,
        name: {
          en: 'Emergence & 4-Leaf Stage',
          kn: 'ಮೊಳಕೆ ಮತ್ತು 4-ಎಲೆ ಹಂತ',
          hi: 'अंकुरण एवं 4-पत्ती अवस्था',
        },
        irrigation: {
          en: 'Provide light irrigation on ridges; maize is highly sensitive to standing water in early weeks.',
          kn: 'ಬೋದುಗಳ ಮೇಲೆ ಲಘು ನೀರು ಹರಿಸಿ; ಆರಂಭದ ದಿನಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿದುಹೋಗಲು ಬಿಡಿ.',
          hi: 'मेड़ों पर हल्की सिंचाई करें; शुरुआती सप्ताहों में मक्का जलभराव के प्रति संवेदनशील होता है।',
        },
        nutrition: {
          en: 'Apply well-rotted FYM + basal rock phosphate/SSP and Zinc Sulphate along planting furrows.',
          kn: 'ಬಿತ್ತನೆ ಸಾಲುಗಳಲ್ಲಿ ಚೆನ್ನಾಗಿ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ, ರಂಜಕ ಮತ್ತು ಸತುವಿನ ಸಲ್ಫೇಟ್ ನೀಡಿ.',
          hi: 'बुआई की नालियों में सड़ी गोबर खाद, बेसल फॉस्फोरस और जिंक सल्फेट का प्रयोग करें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 48,
        name: {
          en: 'Knee-High Growth & Earthing-Up (BSJDK)',
          kn: 'ಮೊಣಕಾಲೆತ್ತರ ಬೆಳವಣಿಗೆ ಮತ್ತು ಮಣ್ಣು ಏರಿಸುವಿಕೆ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'घुटने तक वृद्धि एवं मिट्टी चढ़ाना (BSJDK)',
        },
        irrigation: {
          en: 'Irrigate every 8–10 days in furrows during rapid stem elongation and knee-high growth.',
          kn: 'ಬೆಳೆ ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಈ ಹಂತದಲ್ಲಿ ಪ್ರತಿ 8–10 ದಿನಗಳಿಗೊಮ್ಮೆ ಸಾಲುಗಳಲ್ಲಿ ನೀರುಣಿಸಿ.',
          hi: 'तेज़ तना वृद्धि के दौरान नालियों में हर 8–10 दिन पर सिंचाई करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Perform earthing-up at Day 30 and apply 200 L/acre BSJDK JeevaDhara + 150 kg enriched Ghanajeevamrutha / vermicompost near root ridges.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: 30ನೇ ದಿನದಂದು ಸಾಲುಗಳಿಗೆ ಮಣ್ಣು ಏರಿಸಿ, ಬೇರುಗಳ ಬಳಿ ಎಕರೆಗೆ 200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಮತ್ತು 150 ಕೆಜಿ ಸಮೃದ್ಧ ಘನಜೀವಾಮೃತ/ಎರೆಗೊಬ್ಬರ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: 30वें दिन मिट्टी चढ़ाएं और जड़ों के पास 200 लीटर/एकड़ BSJDK जीवधारा व 150 किग्रा समृद्ध घनजीवामृत/केंचुआ खाद डालें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 80,
        name: {
          en: 'Tasseling, Silking & Cob Fill',
          kn: 'ಹೂಗೊಂಚಲು, ರೇಷ್ಮೆ ಕೂದಲು ಮತ್ತು ತೆನೆ ತುಂಬುವಿಕೆ',
          hi: 'नर मंजरी, सिल्किंग एवं भुट्टा भराव',
        },
        irrigation: {
          en: 'Zero moisture stress allowed! Irrigate reliably during tasseling and silking for full pollination.',
          kn: 'ನೀರಿನ ಕೊರತೆ ಬರದಂತೆ ನೋಡಿಕೊಳ್ಳಿ! ಸಂಪೂರ್ಣ ಪರಾಗಸ್ಪರ್ಶಕ್ಕಾಗಿ ಹೂಗೊಂಚಲು ಮತ್ತು ತೆನೆ ಕಟ್ಟುವಾಗ ತಪ್ಪದೆ ನೀರುಣಿಸಿ.',
          hi: 'नमी की बिल्कुल कमी न होने दें! पूर्ण परागण के लिए मंजरी और सिल्किंग पर समय पर सिंचाई करें।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK bio-extract + soluble Potash/Micronutrients to avoid tip-barren cobs.',
          kn: 'ತೆನೆ ತುದಿ ಖಾಲಿಯಾಗದಂತೆ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೈವಿಕ ದ್ರಾವಣ ಮತ್ತು ಪೊಟ್ಯಾಶ್/ಲಘು ಪೋಷಕಾಂಶ ಸಿಂಪಡಿಸಿ.',
          hi: 'भुट्टे के सिरे खाली न रहें इसके लिए BSJDK जैव अर्क व पोटाश/सूक्ष्म पोषक का छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 105,
        name: {
          en: 'Dent Stage & Cob Harvest',
          kn: 'ಕಾಳು ಗಟ್ಟಿಯಾಗುವಿಕೆ ಮತ್ತು ತೆನೆ ಕೊಯ್ಲು',
          hi: 'दाना सख्त होना एवं भुट्टा कटाई',
        },
        irrigation: {
          en: 'Withdraw irrigation once husks begin turning dry straw color (10–12 days before harvest).',
          kn: 'ತೆನೆಯ ಸಿಪ್ಪೆ ಒಣಗಿ ಒಣಹುಲ್ಲಿನ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ (ಕೊಯ್ಲಿಗೆ 10–12 ದಿನ ಮೊದಲು) ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'भुट्टे के छिलके सूखे भूरे रंग के होने पर (कटाई से 10–12 दिन पहले) सिंचाई बंद करें।',
        },
        nutrition: {
          en: 'Harvest when black layer forms at grain base and husk dries; dry cobs before shelling.',
          kn: 'ಕಾಳಿನ ಬುಡದಲ್ಲಿ ಕಪ್ಪು ಗುರುತು ಕಾಣಿಸಿಕೊಂಡು ಸಿಪ್ಪೆ ಒಣಗಿದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಒಣಗಿಸಿ.',
          hi: 'दाने के आधार पर काला निशान बनने और छिलका सूखने पर कटाई करें व भुट्टे सुखाएं।',
        },
      },
    ],
  },
  wheat: {
    iconName: 'barley',
    defaultTotalDays: 120,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 22,
        name: {
          en: 'Germination & Crown Root (CRI)',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಕಿರೀಟ ಬೇರು ಹಂತ (CRI)',
          hi: 'अंकुरण एवं ताज जड़ अवस्था (CRI)',
        },
        irrigation: {
          en: 'Most critical irrigation at Crown Root Initiation (Day 20–22). Do not delay.',
          kn: 'ಕಿರೀಟ ಬೇರು ಹಂತದಲ್ಲಿ (ದಿನ 20–22) ಮೊದಲ ನೀರಾವರಿ ಅತ್ಯಂತ ಮುಖ್ಯ. ತಡಮಾಡಬೇಡಿ.',
          hi: 'ताज जड़ अवस्था (दिन 20–22) पर पहली सिंचाई अत्यंत आवश्यक है, देरी न करें।',
        },
        nutrition: {
          en: 'Coat seed with BSJDK Beejamrutha; apply basal Phosphorus, Potash, and compost at sowing.',
          kn: 'ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ, ಮೂಲ ರಂಜಕ, ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಕಾಂಪೋಸ್ಟ್ ನೀಡಿ.',
          hi: 'बुआई से पहले BSJDK बीजामृत से बीज उपचार करें तथा बेसल फॉस्फोरस, पोटाश व कम्पोस्ट डालें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 60,
        name: {
          en: 'Tillering & Jointing (BSJDK Nutrition)',
          kn: 'ತೆಂಡೆ ಮತ್ತು ಗಿಣ್ಣು ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ)',
          hi: 'कल्ले निकलना एवं गांठ बनना (BSJDK)',
        },
        irrigation: {
          en: 'Provide second irrigation at active tillering (Day 40–45) and third at late jointing (Day 60).',
          kn: 'ತೆಂಡೆ ಹಂತದಲ್ಲಿ (ದಿನ 40–45) ಎರಡನೇ ಮತ್ತು ಗಿಣ್ಣು ಹಂತದಲ್ಲಿ (ದಿನ 60) ಮೂರನೇ ನೀರಾವರಿ ನೀಡಿ.',
          hi: 'कल्ले फूटते समय (दिन 40–45) दूसरी और गांठ बनते समय (दिन 60) तीसरी सिंचाई करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 200 L/acre BSJDK JeevaDhara bio-culture with irrigation + top-dress vermicompost/Ghanajeevamrutha for strong productive tillers.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಬಲಿಷ್ಠ ತೆಂಡೆಗಳಿಗಾಗಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಎಕರೆಗೆ 200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರಾವಣ ಮತ್ತು ಎರೆಹುಳು ಗೊಬ್ಬರ/ಘನಜೀವಾಮೃತ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: मजबूत कल्लों के लिए सिंचाई के साथ 200 लीटर/एकड़ BSJDK जीवधारा तरल और केंचुआ खाद/घनजीवामृत की टॉप-ड्रेसिंग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 90,
        name: {
          en: 'Heading & Flowering',
          kn: 'ತೆನೆ ಹೊರಬರುವುದು ಮತ್ತು ಹೂವಾಡುವಿಕೆ',
          hi: 'बाली निकलना एवं फूल आना',
        },
        irrigation: {
          en: 'Irrigate lightly at flowering/boot stage on calm wind-free days to prevent crop lodging.',
          kn: 'ಹೂವಾಡುವ ಹಂತದಲ್ಲಿ ಗಾಳಿ ಕಡಿಮೆ ಇರುವಾಗ ಲಘು ನೀರಾವರಿ ನೀಡಿ ಬೆಳೆ ಬೀಳದಂತೆ ಎಚ್ಚರವಹಿಸಿ.',
          hi: 'फूल आते समय शांत दिनों में हल्की सिंचाई करें ताकि फसल गिरे नहीं।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK bio-tonic + 0:52:34 or 13:0:45 water-soluble nutrition for bold grain set.',
          kn: 'ಕಾಳು ದಪ್ಪವಾಗಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ದ್ರಾವಣ ಮತ್ತು ನೀರಿನಲ್ಲಿ ಕರಗುವ ಪೊಟ್ಯಾಶ್ ಪೋಷಕಾಂಶ ಸಿಂಪಡಿಸಿ.',
          hi: 'मोटे दानों के लिए BSJDK जैव टॉनिक व घुलनशील पोटाश युक्त पोषक तत्वों का पर्णीय छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 120,
        name: {
          en: 'Grain Filling & Harvest',
          kn: 'ಕಾಳು ಗಟ್ಟಿಯಾಗುವುದು ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'दाना भरना एवं कटाई',
        },
        irrigation: {
          en: 'Terminal light irrigation at dough stage; cease water 10 days before harvest.',
          kn: 'ಕಾಳು ಗಟ್ಟಿಯಾಗಲು ಅಂತಿಮ ಲಘು ನೀರಾವರಿ ನೀಡಿ; ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'दाना भरते समय अंतिम हल्की सिंचाई करें; कटाई से 10 दिन पहले पानी बंद करें।',
        },
        nutrition: {
          en: 'Harvest when grains turn hard and golden; sun-dry to 12% moisture for weevil-free storage.',
          kn: 'ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗಿ ಬಂಗಾರದ ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಶೇ. 12 ತೇವಾಂಶಕ್ಕೆ ಒಣಗಿಸಿ.',
          hi: 'दानों के सख्त व सुनहरा होने पर कटाई करें और सुरक्षित भंडारण के लिए 12% नमी तक सुखाएं।',
        },
      },
    ],
  },
  cotton: {
    iconName: 'flower-outline',
    defaultTotalDays: 160,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 30,
        name: {
          en: 'Germination & Taproot Establishment',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಆಳಬೇರು ಸ್ಥಾಪನೆ',
          hi: 'अंकुरण एवं मुख्य जड़ स्थापना',
        },
        irrigation: {
          en: 'Light furrow irrigations; prevent soil crusting and stagnant water around seedling stems.',
          kn: 'ಸಾಲುಗಳಲ್ಲಿ ಲಘು ನೀರು ನೀಡಿ; ಸಸಿಗಳ ಬಳಿ ಮಣ್ಣು ಗಟ್ಟಿಯಾಗದಂತೆ ಮತ್ತು ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'हल्की सिंचाई करें; तनों के पास पपड़ी जमने या पानी रुकने से बचाएं।',
        },
        nutrition: {
          en: 'Treat seeds with BSJDK Beejamrutha; incorporate compost + neem cake in planting ridges.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ, ಬಿತ್ತನೆ ಸಾಲುಗಳಲ್ಲಿ ಸಾವಯವ ಗೊಬ್ಬರ ಹಾಗೂ ಬೇವಿನ ಹಿಂಡಿ ಬೆರೆಸಿ.',
          hi: 'BSJDK बीजामृत से बीज उपचार करें; बुआई कतारों में कम्पोस्ट व नीम खली मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 70,
        name: {
          en: 'Vegetative & Square Initiation (BSJDK)',
          kn: 'ಕವಲು ಮತ್ತು ಹೂಮೊಗ್ಗು ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'शाखाएं एवं कली बनना (BSJDK)',
        },
        irrigation: {
          en: 'Irrigate every 10–14 days; avoid excess water that triggers rank foliage and sucking pests.',
          kn: '10–14 ದಿನಗಳಿಗೊಮ್ಮೆ ನಿಯಮಿತ ನೀರು ನೀಡಿ; ಅತಿಯಾದ ನೀರಿನಿಂದ ಅನಗತ್ಯ ಎಲೆ ಬೆಳವಣಿಗೆ ಮತ್ತು ರಸ ಹೀರುವ ಕೀಟ ಹೆಚ್ಚುತ್ತವೆ.',
          hi: '10–14 दिनों पर सिंचाई करें; अधिक पानी से बचें ताकि अनावश्यक पत्तियां व रस चूसक कीट न बढ़ें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Apply 200 L/acre BSJDK JeevaDhara drench + 100 kg neem cake/Ghanajeevamrutha during intercultivation; spray 5% Neemarka for early pest deterrence.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಅಂತರ ಬೇಸಾಯದೊಂದಿಗೆ ಎಕರೆಗೆ 200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಮತ್ತು 100 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ/ಘನಜೀವಾಮೃತ ನೀಡಿ; ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ ಶೇ. 5 ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.',
          hi: 'BSJDK चरण 2: निराई-गुड़ाई के समय 200 लीटर/एकड़ BSJDK जीवधारा व 100 किग्रा नीम खली/घनजीवामृत दें; कीट रोकथाम के लिए 5% नीमार्क छिड़कें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 120,
        name: {
          en: 'Flowering & Boll Development',
          kn: 'ಹೂವು ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ',
          hi: 'फूल एवं टिंडे बनना',
        },
        irrigation: {
          en: 'Most moisture-sensitive phase! Maintain uniform soil moisture to stop square and young boll drop.',
          kn: 'ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ! ಹೂಮೊಗ್ಗು ಮತ್ತು ಎಳೆ ಕಾಯಿ ಉದುರುವುದನ್ನು ತಡೆಯಲು ಸಮತೋಲಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ.',
          hi: 'सबसे संवेदनशील अवस्था! कली व टिंडे झड़ने से रोकने के लिए समान नमी बनाए रखें।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK JeevaDhara + 1% Magnesium Sulphate + 0.1% Boron for healthy boll retention.',
          kn: 'ಕಾಯಿ ಉದುರದಂತೆ ಮತ್ತು ದೊಡ್ಡದಾಗಿ ಬೆಳೆಯಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ + 1% ಮೆಗ್ನೀಸಿಯಮ್ ಸಲ್ಫೇಟ್ + 0.1% ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.',
          hi: 'टिंडे झड़ने से रोकने और आकार बढ़ाने के लिए BSJDK जीवधारा + 1% मैग्नीशियम सल्फेट + 0.1% बोरॉन छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 160,
        name: {
          en: 'Boll Bursting & Clean Picking',
          kn: 'ಕಾಯಿ ಒಡೆಯುವುದು ಮತ್ತು ಹತ್ತಿ ಬಿಡಿಸುವುದು',
          hi: 'टिंडे खुलना एवं चुनाई',
        },
        irrigation: {
          en: 'Cease irrigation once ~20% of bolls burst open to speed uniform boll opening.',
          kn: 'ಶೇ. 20 ಕಾಯಿಗಳು ಒಡೆದ ನಂತರ ನೀರು ನಿಲ್ಲಿಸಿ, ಉಳಿದ ಕಾಯಿಗಳು ಸಮವಾಗಿ ಒಡೆಯಲು ನೆರವಾಗಿ.',
          hi: '20% टिंडे खुलने के बाद सिंचाई बंद कर दें ताकि शेष टिंडे एक समान खुल सकें।',
        },
        nutrition: {
          en: 'Pick dry, clean seed cotton after morning dew evaporates; keep dry leaves out for premium grade.',
          kn: 'ಬೆಳಗಿನ ಇಬ್ಬನಿ ಆವಿಯಾದ ನಂತರ ಒಣಗಿದ ಶುದ್ಧ ಹತ್ತಿಯನ್ನು ಬಿಡಿಸಿ ಬೇರ್ಪಡಿಸಿ.',
          hi: 'सुबह की ओस सूखने के बाद साफ़ सूखी कपास की चुनाई करें और पत्तियां न मिलने दें।',
        },
      },
    ],
  },
  sugarcane: {
    iconName: 'sprout-outline',
    defaultTotalDays: 330,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 45,
        name: {
          en: 'Sett Germination & Shoot Emergence',
          kn: 'ಕಬ್ಬಿನ ತುಂಡು ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ',
          hi: 'गन्ना अंकुरण एवं कल्ले निकलना',
        },
        irrigation: {
          en: 'Keep furrow ridges moist with light irrigations every 5–7 days until uniform emergence completes.',
          kn: 'ತುಂಡುಗಳು ಸಮವಾಗಿ ಮೊಳಕೆಯೊಡೆಯುವವರೆಗೆ ಪ್ರತಿ 5–7 ದಿನಕ್ಕೊಮ್ಮೆ ಸಾಲುಗಳಲ್ಲಿ ಲಘು ನೀರು ಹರಿಸಿ.',
          hi: 'समान अंकुरण पूरा होने तक हर 5–7 दिन पर नालियों में हल्की सिंचाई बनाए रखें।',
        },
        nutrition: {
          en: 'Dip 2-bud setts in BSJDK Beejamrutha solution for 15 min; apply FYM + pressmud + Phosphorus in trenches.',
          kn: 'ಎರಡು ಕಣ್ಣಿನ ತುಂಡುಗಳನ್ನು 15 ನಿಮಿಷ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಲ್ಲಿ ಅದ್ದಿ ನಾಟಿ ಮಾಡಿ, ಸಾಲುಗಳಲ್ಲಿ ಕೊಟ್ಟಿಗೆ/ಪ್ರೆಸ್‌ಮಡ್ ಗೊಬ್ಬರ ನೀಡಿ.',
          hi: 'दो आंख वाले टुकड़ों को 15 मिनट BSJDK बीजामृत में डुबोकर बोएं; खाई में गोबर खाद, प्रेसमड व फॉस्फोरस डालें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 135,
        name: {
          en: 'Tillering & Formative Stage (BSJDK)',
          kn: 'ತೆಂಡೆ ಮತ್ತು ಕಾಂಡ ರಚನಾ ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'कल्ले फूटने की अवस्था (BSJDK)',
        },
        irrigation: {
          en: 'Irrigate every 7–10 days in summer; spread dried cane trash mulch between rows to conserve 30% water.',
          kn: 'ಬೇಸಿಗೆಯಲ್ಲಿ 7–10 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರುಣಿಸಿ; ಸಾಲುಗಳ ನಡುವೆ ಕಬ್ಬಿನ ತರಗು ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಹಾಕಿ ನೀರು ಉಳಿಸಿ.',
          hi: 'गर्मियों में हर 7–10 दिन पर सिंचाई करें; पानी बचाने के लिए कतारों के बीच गन्ने की सूखी पत्ती बिछाएं।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Apply 250 L/acre BSJDK JeevaDhara via drip/furrow every 21 days + 200 kg/acre Ghanajeevamrutha & neem cake during partial earthing-up.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ 21 ದಿನಕ್ಕೊಮ್ಮೆ ಹನಿ/ಸಾಲು ನೀರಾವರಿಯಲ್ಲಿ ಎಕರೆಗೆ 250 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಹಾಗೂ ಮಣ್ಣು ಏರಿಸುವಾಗ 200 ಕೆಜಿ ಘನಜೀವಾಮೃತ ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: हर 21 दिन में ड्रिप/नाली से 250 लीटर/एकड़ BSJDK जीवधारा तथा मिट्टी चढ़ाते समय 200 किग्रा घनजीवामृत व नीम खली डालें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 260,
        name: {
          en: 'Grand Growth & Cane Elongation',
          kn: 'ತೀವ್ರ ಬೆಳವಣಿಗೆ ಮತ್ತು ಗಿಣ್ಣು ಉದ್ದವಾಗುವ ಹಂತ',
          hi: 'तीव्र बढ़वार एवं गन्ना लंबाई चरण',
        },
        irrigation: {
          en: 'Peak water demand! Ensure deep moisture without waterlogging; complete final earthing-up and propping.',
          kn: 'ಅತಿ ಹೆಚ್ಚು ನೀರಿನ ಬೇಡಿಕೆಯ ಹಂತ! ನೀರು ನಿಲ್ಲದಂತೆ ಆಳವಾದ ತೇವಾಂಶ ಕಾಪಾಡಿ, ಅಂತಿಮ ಮಣ್ಣು ಏರಿಸಿ ಕಬ್ಬು ಕಟ್ಟಿ.',
          hi: 'सर्वाधिक पानी की मांग! जलभराव के बिना गहरी नमी बनाए रखें और गन्ने की बंधाई (प्रॉपिंग) करें।',
        },
        nutrition: {
          en: 'Boost cane girth with BSJDK JeevaDhara + Potash & Iron/Zinc micronutrient drenching.',
          kn: 'ಕಬ್ಬಿನ ದಪ್ಪ ಮತ್ತು ತೂಕ ಹೆಚ್ಚಿಸಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ, ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಕಬ್ಬಿಣ/ಸತು ಲಘು ಪೋಷಕಾಂಶ ನೀಡಿ.',
          hi: 'गन्ने की मोटाई और वजन बढ़ाने के लिए BSJDK जीवधारा, पोटाश व आयरन/जिंक सूक्ष्म पोषक दें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 330,
        name: {
          en: 'Ripening, Brix Peak & Harvest',
          kn: 'ಪಕ್ವತೆ, ಸಕ್ಕರೆ ಅಂಶ ಮತ್ತು ಕಟಾವು',
          hi: 'परिपक्वता, मिठास एवं कटाई',
        },
        irrigation: {
          en: 'Gradually widen irrigation interval and stop water 15–20 days before cutting to concentrate cane sugar.',
          kn: 'ಕಬ್ಬಿನಲ್ಲಿ ಸಕ್ಕರೆ ಅಂಶ (Brix) ಹೆಚ್ಚಿಸಲು ಕಟಾವಿಗೆ 15–20 ದಿನಗಳ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'गन्ने में चीनी की मात्रा बढ़ाने के लिए कटाई से 15–20 दिन पहले सिंचाई बंद कर दें।',
        },
        nutrition: {
          en: 'Stop all soil/foliar feeds. Cut canes flush to ground level and supply fresh to mill within 24 hours.',
          kn: 'ಎಲ್ಲಾ ಪೋಷಕಾಂಶ ನೀಡುವಿಕೆ ನಿಲ್ಲಿಸಿ. ನೆಲದ ಮಟ್ಟಕ್ಕೆ ಕಬ್ಬು ಕಡಿದು 24 ಗಂಟೆಯೊಳಗೆ ಕಾರ್ಖಾನೆಗೆ ಸಾಗಿಸಿ.',
          hi: 'सभी पोषण बंद करें। ज़मीन की सतह से कटाई कर 24 घंटे के भीतर मिल या कोल्हू में पहुंचाएं।',
        },
      },
    ],
  },
  tomato: {
    iconName: 'food-apple-outline',
    defaultTotalDays: 110,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 22,
        name: {
          en: 'Transplanting & Root Establishment',
          kn: 'ನಾಟಿ ಮತ್ತು ಬೇರು ಸ್ಥಾಪನೆ',
          hi: 'रोपाई एवं जड़ स्थापना',
        },
        irrigation: {
          en: 'Light daily/alternate-day drip or spot watering for first 10 days after transplanting.',
          kn: 'ನಾಟಿ ಮಾಡಿದ ಮೊದಲ 10 ದಿನ ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಬುಡಕ್ಕೆ ಲಘು ನೀರು ನೀಡಿ.',
          hi: 'रोपाई के पहले 10 दिन हल्का ड्रिप या प्रति पौधा पानी दें।',
        },
        nutrition: {
          en: 'Dip seedling roots in BSJDK Beejamrutha; enrich beds with Trichoderma-fortified compost.',
          kn: 'ಸಸಿ ಬೇರುಗಳನ್ನು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಲ್ಲಿ ಅದ್ದಿ ನಾಟಿ ಮಾಡಿ; ಪಾತಿಗಳಿಗೆ ಟ್ರೈಕೋಡರ್ಮಾ ಮಿಶ್ರಿತ ಕಾಂಪೋಸ್ಟ್ ಸೇರಿಸಿ.',
          hi: 'पौध की जड़ों को BSJDK बीजामृत में डुबोकर लगाएं; क्यारियों में ट्राइकोडर्मा युक्त कम्पोस्ट मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 48,
        name: {
          en: 'Branching, Staking & BSJDK Care',
          kn: 'ಕವಲು, ಆಸರೆ ಕಟ್ಟುವಿಕೆ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ',
          hi: 'शाखाएं, सहारा देना एवं BSJDK पोषण',
        },
        irrigation: {
          en: 'Consistent drip irrigation every 2–3 days; use plastic or straw mulch to stabilize root moisture.',
          kn: 'ಪ್ರತಿ 2–3 ದಿನಗಳಿಗೊಮ್ಮೆ ಹನಿ ನೀರಾವರಿ ನೀಡಿ; ತೇವಾಂಶ ಕಾಯ್ದುಕೊಳ್ಳಲು ಮಲ್ಚಿಂಗ್ ಬಳಸಿ.',
          hi: 'हर 2–3 दिन में नियमित ड्रिप सिंचाई करें और नमी के लिए मल्चिंग का उपयोग करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 150 L/acre BSJDK JeevaDhara every 15 days + vermicompost around root zone; install stakes/trellis and prune bottom suckers.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ 15 ದಿನಕ್ಕೊಮ್ಮೆ ಎಕರೆಗೆ 150 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಮತ್ತು ಎರೆಗೊಬ್ಬರ ನೀಡಿ; ಗಿಡಗಳಿಗೆ ಕೋಲು ಆಸರೆ ಕಟ್ಟಿ ಕೆಳಗಿನ ಅನಗತ್ಯ ಕವಲು ತೆಗೆಯಿರಿ.',
          hi: 'BSJDK चरण 2: हर 15 दिन में 150 लीटर/एकड़ BSJDK जीवधारा व केंचुआ खाद जड़ों में दें; बांस/तार का सहारा लगाएं और निचली शाखाएं छांटें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 80,
        name: {
          en: 'Flowering & Fruit Set',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ',
          hi: 'फूल आना एवं फल लगना',
        },
        irrigation: {
          en: 'Avoid wide wet-dry swings — irregular moisture causes blossom-end rot and fruit cracking.',
          kn: 'ನೀರಿನ ವ್ಯತ್ಯಾಸವಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ — ಅನಿಯಮಿತ ನೀರಾವರಿಯಿಂದ ಹಣ್ಣು ಸೀಳುವುದು ಮತ್ತು ತುದಿ ಕೊಳೆಯುವ ರೋಗ ಬರುತ್ತದೆ.',
          hi: 'सिंचाई में भारी उतार-चढ़ाव से बचें — अनियमित नमी से फल फटने व सड़ने की समस्या होती है।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK JeevaDhara + Calcium & Boron (0.2%) to boost flower retention and firm fruits.',
          kn: 'ಹೂವು ಉದುರದಂತೆ ಮತ್ತು ಹಣ್ಣು ಗಟ್ಟಿಯಾಗಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಜೊತೆ ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಬೋರಾನ್ (0.2%) ಸಿಂಪಡಿಸಿ.',
          hi: 'फूल झड़ने से रोकने और ठोस फल के लिए BSJDK जीवधारा के साथ कैल्शियम व बोरॉन (0.2%) का छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 110,
        name: {
          en: 'Fruit Ripening & Multiple Pickings',
          kn: 'ಹಣ್ಣಾಗುವಿಕೆ ಮತ್ತು ಹಂತ-ಹಂತದ ಕಟಾವು',
          hi: 'फल पकना एवं तुड़ाई',
        },
        irrigation: {
          en: 'Reduce irrigation slightly between pickings to improve fruit TSS sweetness and shelf life.',
          kn: 'ಹಣ್ಣಿನ ರುಚಿ ಮತ್ತು ಬಾಳಿಕೆ ಹೆಚ್ಚಿಸಲು ಕಟಾವಿನ ನಡುವೆ ನೀರನ್ನು ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.',
          hi: 'फलों की मिठास और भंडारण क्षमता बढ़ाने के लिए तुड़ाई के बीच पानी थोड़ा कम रखें।',
        },
        nutrition: {
          en: 'Continue gentle BSJDK JeevaDhara fertigation between flushes; pick at breaker/pink stage for market transport.',
          kn: 'ಹಂತಗಳ ನಡುವೆ ಲಘು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಪೋಷಣೆ ಮುಂದುವರಿಸಿ; ಸಾಗಣೆಗೆ ಕೆಂಪು-ಗುಲಾಬಿ ಬಣ್ಣದಲ್ಲೇ ಕೊಯ್ಲು ಮಾಡಿ.',
          hi: 'तुड़ाई के बीच हल्का BSJDK जीवधारा पोषण जारी रखें; मंडी भेजने के लिए हल्की लाली आने पर तोड़ें।',
        },
      },
    ],
  },
  chilli: {
    iconName: 'chili-mild',
    defaultTotalDays: 150,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 25,
        name: {
          en: 'Transplanting & Seedling Care',
          kn: 'ನಾಟಿ ಮತ್ತು ಸಸಿ ಆರೈಕೆ',
          hi: 'रोपाई एवं पौध देखभाल',
        },
        irrigation: {
          en: 'Keep ridge soil lightly moist without waterlogging to avoid Pythium damping-off.',
          kn: 'ಸಸಿ ಕೊಳೆಯುವ ರೋಗ ತಡೆಯಲು ನೀರು ನಿಲ್ಲದಂತೆ ಲಘು ತೇವಾಂಶ ಮಾತ್ರ ಕಾಪಾಡಿ.',
          hi: 'गलन रोग से बचाने के लिए जलभराव के बिना हल्की नमी बनाए रखें।',
        },
        nutrition: {
          en: 'Root dip in BSJDK Beejamrutha + Pseudomonas; basal compost + neem cake in raised beds.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಲ್ಲಿ ಬೇರು ಅದ್ದಿ ನಾಟಿ ಮಾಡಿ; ಏರುಮಡಿಗಳಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ನೀಡಿ.',
          hi: 'BSJDK बीजामृत में जड़ डुबोकर रोपाई करें; उठी क्यारियों में कम्पोस्ट व नीम खली डालें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 65,
        name: {
          en: 'Canopy Branching & BSJDK Bio-Care',
          kn: 'ಕವಲು ಬೆಳವಣಿಗೆ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಆರೈಕೆ',
          hi: 'शाखा विस्तार एवं BSJDK देखभाल',
        },
        irrigation: {
          en: 'Irrigate every 5–7 days (or drip every 2 days); avoid wet foliage late in the evening.',
          kn: '5–7 ದಿನಕ್ಕೊಮ್ಮೆ (ಅಥವಾ 2 ದಿನಕ್ಕೊಮ್ಮೆ ಹನಿ) ನೀರುಣಿಸಿ; ಸಂಜೆ ವೇಳೆ ಎಲೆಗಳು ಒದ್ದೆಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'हर 5–7 दिन में सिंचाई (या हर 2 दिन ड्रिप) करें; देर शाम पत्तियां गीली न होने दें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 180 L/acre BSJDK JeevaDhara + apply enriched vermicompost; spray fermented buttermilk/neem oil to prevent thrips & leaf curl.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಎಕರೆಗೆ 180 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಮತ್ತು ಎರೆಹುಳು ಗೊಬ್ಬರ ನೀಡಿ; ಮುರುಟು ರೋಗ/ನುಸಿ ತಡೆಯಲು ಹುಳಿ ಮಜ್ಜಿಗೆ ಮತ್ತು ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
          hi: 'BSJDK चरण 2: 180 लीटर/एकड़ BSJDK जीवधारा व केंचुआ खाद दें; थ्रिप्स व पत्ती मरोड़ रोकने के लिए खट्टी छाछ/नीम तेल का छिड़काव करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 110,
        name: {
          en: 'Flowering & Pod Setting',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ',
          hi: 'फूल आना एवं मिर्च लगना',
        },
        irrigation: {
          en: 'Maintain steady root-zone moisture; both drought and over-watering cause heavy flower drop.',
          kn: 'ಬೇರುಗಳ ಬಳಿ ಸ್ಥಿರ ತೇವಾಂಶ ಕಾಪಾಡಿ; ಒಣಗುವಿಕೆ ಮತ್ತು ಅತಿ ನೀರು ಎರಡೂ ಹೂವು ಉದುರಲು ಕಾರಣವಾಗುತ್ತವೆ.',
          hi: 'जड़ों में स्थिर नमी रखें; सूखे और अधिक पानी दोनों से फूल झड़ते हैं।',
        },
        nutrition: {
          en: 'Spray BSJDK JeevaDhara (1:10) + Potash & Micronutrients to improve pod length, color, and pungency.',
          kn: 'ಕಾಯಿ ಉದ್ದ, ಹೊಳಪು ಮತ್ತು ಖಾರ ಹೆಚ್ಚಿಸಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ (1:10), ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ ಸಿಂಪಡಿಸಿ.',
          hi: 'मिर्च की लंबाई, चमक व तीखापन बढ़ाने के लिए BSJDK जीवधारा (1:10), पोटाश व सूक्ष्म पोषक छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 150,
        name: {
          en: 'Green/Red Pod Picking & Curing',
          kn: 'ಹಸಿ/ಕೆಂಪು ಮೆಣಸಿನಕಾಯಿ ಕೊಯ್ಲು ಮತ್ತು ಒಣಗಿಸುವಿಕೆ',
          hi: 'हरी/लाल मिर्च तुड़ाई एवं सुखाना',
        },
        irrigation: {
          en: 'Give light irrigation right after each picking flush; cut back water if harvesting dry red chilli.',
          kn: 'ಪ್ರತಿ ಕೊಯ್ಲಿನ ನಂತರ ಲಘು ನೀರು ನೀಡಿ; ಒಣ ಕೆಂಪು ಮೆಣಸಿಗೆ ನೀರು ಕಡಿಮೆ ಮಾಡಿ.',
          hi: 'प्रत्येक तुड़ाई के बाद हल्की सिंचाई करें; सूखी लाल मिर्च के लिए पानी कम रखें।',
        },
        nutrition: {
          en: 'Pick in cool morning hours and dry red pods cleanly on raised mats/tarpaulins away from soil.',
          kn: 'ತಂಪಾದ ಬೆಳಗಿನ ವೇಳೆಯಲ್ಲಿ ಕೊಯ್ಲು ಮಾಡಿ, ಮಣ್ಣು ತಾಗದಂತೆ ಸ್ವಚ್ಛ ಚಾಪೆಗಳ ಮೇಲೆ ಒಣಗಿಸಿ.',
          hi: 'सुबह के ठंडे समय में तुड़ाई करें और लाल मिर्च को साफ चटाई/तिरपाल पर सुखाएं।',
        },
      },
    ],
  },
  onion: {
    iconName: 'spa-outline',
    defaultTotalDays: 125,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 22,
        name: {
          en: 'Transplanting & Root Set',
          kn: 'ನಾಟಿ ಮತ್ತು ಬೇರು ಕಟ್ಟುವ ಹಂತ',
          hi: 'रोपाई एवं जड़ पकड़ना',
        },
        irrigation: {
          en: 'Light irrigation immediately at transplanting and every 3–4 days until roots anchor firmly.',
          kn: 'ನಾಟಿ ಮಾಡಿದ ತಕ್ಷಣ ಮತ್ತು ಬೇರು ಗಟ್ಟಿಯಾಗುವವರೆಗೆ ಪ್ರತಿ 3–4 ದಿನಕ್ಕೊಮ್ಮೆ ಲಘು ನೀರು ನೀಡಿ.',
          hi: 'रोपाई के तुरंत बाद और जड़ें जमने तक हर 3–4 दिन में हल्की सिंचाई करें।',
        },
        nutrition: {
          en: 'Root dip in BSJDK Beejamrutha; incorporate compost + Sulphur (20 kg/ha) in beds for pungency.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಲ್ಲಿ ಬೇರು ಅದ್ದಿ ನಾಟಿ ಮಾಡಿ; ಪಾತಿಗಳಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ಗಂಧಕ (20 ಕೆಜಿ/ಹೆ.) ಬೆರೆಸಿ.',
          hi: 'BSJDK बीजामृत में जड़ डुबोकर लगाएं; क्यारियों में कम्पोस्ट व गंधक (20 किग्रा/हे.) मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 60,
        name: {
          en: 'Leaf Flush & BSJDK Bio-Enrichment',
          kn: 'ಎಲೆ ಬೆಳವಣಿಗೆ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ',
          hi: 'पत्तियों की बढ़वार एवं BSJDK पोषण',
        },
        irrigation: {
          en: 'Shallow frequent watering (every 6–7 days on beds) as onion roots stay in top 15 cm soil.',
          kn: 'ಈರುಳ್ಳಿ ಬೇರುಗಳು ಮೇಲಿನ 15 ಸೆಂ.ಮೀ ಮಣ್ಣಿನಲ್ಲಿರುವುದರಿಂದ ಪ್ರತಿ 6–7 ದಿನಕ್ಕೊಮ್ಮೆ ಲಘು ನೀರುಣಿಸಿ.',
          hi: 'प्याज की जड़ें ऊपरी 15 सेमी में रहती हैं, इसलिए हर 6–7 दिन में हल्की सिंचाई करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 200 L/acre BSJDK JeevaDhara + 100 kg/acre vermicompost/Ghanajeevamrutha; keep beds weed-free for healthy tubular leaves.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಎಕರೆಗೆ 200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಹಾಗೂ 100 ಕೆಜಿ ಎರೆಗೊಬ್ಬರ/ಘನಜೀವಾಮೃತ ನೀಡಿ; ಕಳೆ ಇಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'BSJDK चरण 2: 200 लीटर/एकड़ BSJDK जीवधारा व 100 किग्रा केंचुआ खाद/घनजीवामृत दें; स्वस्थ पत्तियों के लिए निराई साफ रखें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 100,
        name: {
          en: 'Bulb Initiation & Bulking',
          kn: 'ಗಡ್ಡೆ ಕಟ್ಟುವಿಕೆ ಮತ್ತು ದಪ್ಪವಾಗುವ ಹಂತ',
          hi: 'कंद बनना एवं आकार बढ़ना',
        },
        irrigation: {
          en: 'Maintain even moisture during bulb expansion; avoid waterlogging to prevent purple blotch & basal rot.',
          kn: 'ಗಡ್ಡೆ ಬೆಳೆಯುವಾಗ ಸಮತೋಲಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ; ಗಡ್ಡೆ ಕೊಳೆಯದಂತೆ ನೀರು ನಿಲ್ಲದಂತೆ ಎಚ್ಚರವಹಿಸಿ.',
          hi: 'कंद फूलते समय समान नमी रखें; बैंगनी धब्बा व सड़न से बचने के लिए जलभराव रोकें।',
        },
        nutrition: {
          en: 'Apply Potash + Sulphur foliar/drip support with BSJDK JeevaDhara for firm, glossy, long-storing bulbs.',
          kn: 'ಗಟ್ಟಿ, ಹೊಳೆಯುವ ಮತ್ತು ಹೆಚ್ಚು ದಿನ ಬಾಳಿಕೆ ಬರುವ ಗಡ್ಡೆಗಳಿಗಾಗಿ ಪೊಟ್ಯಾಶ್, ಗಂಧಕ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ನೀಡಿ.',
          hi: 'ठोस, चमकदार और लंबे समय तक टिकने वाले प्याज के लिए पोटाश, गंधक व BSJDK जीवधारा दें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 125,
        name: {
          en: 'Neck Fall, Curing & Harvest',
          kn: 'ಕುತ್ತಿಗೆ ಬಾಗುವುದು, ಆರಿಸುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'गर्दन झुकना, सुखाना एवं खुदाई',
        },
        irrigation: {
          en: 'Stop irrigation completely 12–15 days prior to lifting once 50% of tops fall over naturally.',
          kn: 'ಶೇ. 50 ಎಲೆಗಳು ತಾನಾಗಿಯೇ ಬಾಗಿದ ನಂತರ ಕಟಾವಿಗೆ 12–15 ದಿನ ಮೊದಲು ನೀರು ಸಂಪೂರ್ಣ ನಿಲ್ಲಿಸಿ.',
          hi: '50% पत्तियां अपने आप झुकने पर खुदाई से 12–15 दिन पहले सिंचाई पूरी तरह बंद करें।',
        },
        nutrition: {
          en: 'Lift bulbs carefully and shade-cure for 7–10 days before trimming necks to 2–3 cm for storage.',
          kn: 'ಗಡ್ಡೆಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಕಿತ್ತು 7–10 ದಿನ ನೆರಳಿನಲ್ಲಿ ಆರಿಸಿ, ನಂತರ ಕುತ್ತಿಗೆ ಭಾಗ 2–3 ಸೆಂ.ಮೀ ಬಿಟ್ಟು ಕತ್ತರಿಸಿ.',
          hi: 'कंद सावधानी से निकालकर 7–10 दिन छाया में सुखाएं, फिर 2–3 सेमी गर्दन छोड़कर काटें।',
        },
      },
    ],
  },
  groundnut: {
    iconName: 'peanut-outline',
    defaultTotalDays: 115,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 20,
        name: {
          en: 'Germination & Taproot Growth',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಬೇರು ಬೆಳವಣಿಗೆ',
          hi: 'अंकुरण एवं जड़ विकास',
        },
        irrigation: {
          en: 'Light pre-sowing or post-sowing moisture; avoid heavy flooding which rots oily seeds.',
          kn: 'ಬಿತ್ತನೆ ವೇಳೆ ಲಘು ತೇವಾಂಶ ಮಾತ್ರ ಸಾಕು; ಅತಿಯಾದ ನೀರು ಬೀಜ ಕೊಳೆಯಲು ಕಾರಣವಾಗುತ್ತದೆ.',
          hi: 'बुआई के समय हल्की नमी रखें; अधिक पानी से तैलीय बीज सड़ सकते हैं।',
        },
        nutrition: {
          en: 'Treat kernels gently with BSJDK Beejamrutha + Rhizobium + PSB culture before sowing.',
          kn: 'ಬಿತ್ತನೆಗೆ ಮೊದಲು ಶೇಂಗಾ ಬೀಜಗಳಿಗೆ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತ, ರೈಜೋಬಿಯಂ ಮತ್ತು ಪಿಎಸ್‌ಬಿ ಲೇಪನ ಮಾಡಿ.',
          hi: 'बुआई से पहले दानों को BSJDK बीजामृत, राइजोबियम व PSB कल्चर से उपचारित करें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 45,
        name: {
          en: 'Branching & BSJDK Bio-Enrichment',
          kn: 'ಕವಲು ಹಂತ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ',
          hi: 'शाखा विस्तार एवं BSJDK पोषण',
        },
        irrigation: {
          en: 'Irrigate lightly at 20–25 days; slight moisture restraint now encourages deeper rooting.',
          kn: '20–25 ದಿನಗಳಲ್ಲಿ ಲಘು ನೀರು ನೀಡಿ; ಬೇರು ಆಳಕ್ಕೆ ಇಳಿಯಲು ಅತಿಯಾದ ನೀರು ಹಾಕಬೇಡಿ.',
          hi: '20–25 दिन पर हल्की सिंचाई करें; गहरी जड़ों के लिए अत्यधिक पानी से बचें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 150–200 L/acre BSJDK JeevaDhara + loosen inter-row soil cleanly (avoid high synthetic nitrogen which suppresses Rhizobium nodules).',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಎಕರೆಗೆ 150–200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ನೀಡಿ ಮಣ್ಣು ಸಡಿಲಗೊಳಿಸಿ (ರೈಜೋಬಿಯಂ ಗಂಟುಗಳಿಗೆ ಹಾನಿಯಾಗುವ ಕೃತಕ ಸಾರಜನಕ ತಪ್ಪಿಸಿ).',
          hi: 'BSJDK चरण 2: 150–200 लीटर/एकड़ BSJDK जीवधारा का प्रयोग करें और मिट्टी भुरभुरी बनाएं (राइजोबियम गांठों के लिए अतिरिक्त रासायनिक नाइट्रोजन से बचें)।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 88,
        name: {
          en: 'Flowering, Pegging & Pod Filling',
          kn: 'ಹೂವಾಡುವಿಕೆ, ಊರುಗೋಲು ಇಳಿಯುವುದು ಮತ್ತು ಕಾಯಿ ತುಂಬುವಿಕೆ',
          hi: 'फूल आना, सूइयां बनना एवं फली भराव',
        },
        irrigation: {
          en: 'Critical moisture stage! Keep topsoil soft and moist so pegs penetrate easily and pods fill.',
          kn: 'ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಹಂತ! ಊರುಗೋಲು ಮಣ್ಣಿನಲ್ಲಿ ಸರಾಗವಾಗಿ ಇಳಿದು ಕಾಯಿ ತುಂಬಲು ಮೇಲ್ಮಣ್ಣು ಮೃದು ಹಾಗೂ ತೇವವಾಗಿರಲಿ.',
          hi: 'अति महत्वपूर्ण अवस्था! सूइयों (पेग्स) के मिट्टी में आसानी से जाने और फली भरने के लिए ऊपरी मिट्टी नरम व नम रखें।',
        },
        nutrition: {
          en: 'Apply Gypsum (200 kg/acre) around base at flowering + spray BSJDK JeevaDhara & Boron for filled 2-kernel pods.',
          kn: 'ಹೂವಾಡುವ ಸಮಯದಲ್ಲಿ ಬುಡಕ್ಕೆ ಎಕರೆಗೆ 200 ಕೆಜಿ ಜಿಪ್ಸಂ ಹಾಕಿ; ತುಂಬಿದ ಕಾಯಿಗಳಿಗಾಗಿ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.',
          hi: 'फूल आते समय जड़ों के पास 200 किग्रा/एकड़ जिप्सम डालें तथा पूर्ण दानों के लिए BSJDK जीवधारा व बोरॉन छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 115,
        name: {
          en: 'Pod Maturity & Lifting',
          kn: 'ಕಾಯಿ ಪಕ್ವತೆ ಮತ್ತು ಕಿತ್ತು ಒಣಗಿಸುವುದು',
          hi: 'फली परिपक्वता एवं खुदाई',
        },
        irrigation: {
          en: 'Stop watering 10 days before harvest; give a very light softening sprinkle only if clay soil is too hard to pull.',
          kn: 'ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ; ಮಣ್ಣು ತುಂಬಾ ಗಟ್ಟಿಯಾಗಿದ್ದರೆ ಮಾತ್ರ ಕೀಳುವ ಮುನ್ನ ಲಘು ನೀರು ಚಿಮುಕಿಸಿ.',
          hi: 'खुदाई से 10 दिन पहले पानी रोक दें; मिट्टी बहुत सख्त होने पर ही निकालने से पहले हल्का छिड़काव करें।',
        },
        nutrition: {
          en: 'Harvest when 75–80% inner shells show dark veins; dry pods thoroughly to avoid aflatoxin mold.',
          kn: 'ಶೇ. 75–80 ಕಾಯಿಗಳ ಒಳ ಸಿಪ್ಪೆಯಲ್ಲಿ ಕಪ್ಪು ಗೆರೆಗಳು ಕಂಡಾಗ ಕಿತ್ತು ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ.',
          hi: '75–80% फलियों के अंदर गहरे निशान दिखने पर खुदाई करें और फफूंद से बचाने के लिए अच्छी तरह सुखाएं।',
        },
      },
    ],
  },
  arecanut: {
    iconName: 'palm-tree',
    defaultTotalDays: 180,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 35,
        name: {
          en: 'Basin Cleaning & Mulch Opening',
          kn: 'ಬುಡ ಸ್ವಚ್ಛತೆ ಮತ್ತು ಪಾತಿ ಸಿದ್ಧತೆ',
          hi: 'थाला सफाई एवं मल्च तैयारी',
        },
        irrigation: {
          en: 'Maintain steady basin moisture via drip or micro-sprinkler; ensure monsoon drainage trenches are open.',
          kn: 'ಹನಿ ಅಥವಾ ಸೂಕ್ಷ್ಮ ತುಂತುರು ನೀರಾವರಿಯಿಂದ ಬುಡದಲ್ಲಿ ಸಮತೋಲಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ; ಮಳೆಗಾಲದ ಬಸಿಕಾಲುವೆ ಸ್ವಚ್ಛವಾಗಿರಲಿ.',
          hi: 'ड्रिप या माइक्रो-स्प्रिंकलर से थाले में नमी बनाए रखें; जल निकासी नालियां खुली रखें।',
        },
        nutrition: {
          en: 'Open shallow root basin (75 cm radius) and apply well-rotted green leaf manure / farm compost.',
          kn: 'ಮರದ ಸುತ್ತ 75 ಸೆಂ.ಮೀ ಆಳವಿಲ್ಲದ ಪಾತಿ ತೆಗೆದು ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಅಥವಾ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ.',
          hi: 'पेड़ के चारों ओर 75 सेमी उथला थाला बनाकर हरी खाद या सड़ा गोबर कम्पोस्ट मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 85,
        name: {
          en: 'Crown Flush & BSJDK Basin Enrichment',
          kn: 'ಹೊಸ ಗರಿ ಬೆಳವಣಿಗೆ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬುಡ ಪೋಷಣೆ',
          hi: 'नया पत्ता विकास एवं BSJDK थाला पोषण',
        },
        irrigation: {
          en: 'Supply 20–30 L/palm/day (arecanut) or 45–60 L/palm/day (coconut) in dry months under organic mulch.',
          kn: 'ಒಣ ದಿನಗಳಲ್ಲಿ ಮಲ್ಚಿಂಗ್ ಕೆಳಗೆ ಪ್ರತಿ ಮರಕ್ಕೆ ದಿನಕ್ಕೆ 20–30 ಲೀ. (ಅಡಿಕೆ) ಅಥವಾ 45–60 ಲೀ. (ತೆಂಗು) ನೀರು ನೀಡಿ.',
          hi: 'सूखे दिनों में मल्च के नीचे प्रति पेड़ 20–30 लीटर (सुपारी) या 45–60 लीटर (नारियल) सिंचाई दें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Apply 5–10 L BSJDK JeevaDhara per palm basin + 5 kg Ghanajeevamrutha & 1 kg neem cake, then cover with dry palm fronds/leaf mulch.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ ಮರದ ಬುಡಕ್ಕೆ 5–10 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ, 5 ಕೆಜಿ ಘನಜೀವಾಮೃತ ಮತ್ತು 1 ಕೆಜಿ ಬೇವಿನ ಹಿಂಡಿ ಹಾಕಿ ಒಣ ಗರಿಗಳಿಂದ ಮುಚ್ಚಿ.',
          hi: 'BSJDK चरण 2: प्रति पेड़ थाले में 5–10 लीटर BSJDK जीवधारा, 5 किग्रा घनजीवामृत व 1 किग्रा नीम खली डालकर सूखे पत्तों से ढकें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 140,
        name: {
          en: 'Inflorescence, Button Set & Nut Fill',
          kn: 'ಹೊಂಬಾಳೆ, ಹರಳು ಕಟ್ಟುವಿಕೆ ಮತ್ತು ಕಾಯಿ ತುಂಬುವಿಕೆ',
          hi: 'मंजरी, छोटे फल एवं दाना भराव',
        },
        irrigation: {
          en: 'Zero moisture interruption! Drought during button setting causes heavy immature nut shedding.',
          kn: 'ನೀರಿನ ಕೊರತೆ ಬರದಂತೆ ನೋಡಿಕೊಳ್ಳಿ! ಎಳೆ ಕಾಯಿ ಕಟ್ಟುವಾಗ ಒಣಗಿದರೆ ಹರಳು ಉದುರುವಿಕೆ ಹೆಚ್ಚುತ್ತದೆ.',
          hi: 'नमी बिल्कुल टूटने न दें! छोटे फल बनते समय सूखे से भारी फल झड़न होती है।',
        },
        nutrition: {
          en: 'Supplement Potash + Borax (50 g/palm) & Magnesium Sulphate with BSJDK JeevaDhara to prevent nut splitting.',
          kn: 'ಕಾಯಿ ಸೀಳುವುದನ್ನು ತಡೆಯಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಜೊತೆ ಪೊಟ್ಯಾಶ್, ಬೋರಾಕ್ಸ್ (50 ಗ್ರಾಂ/ಮರ) ಮತ್ತು ಮೆಗ್ನೀಸಿಯಮ್ ಸಲ್ಫೇಟ್ ನೀಡಿ.',
          hi: 'फल फटने से रोकने के लिए BSJDK जीवधारा के साथ पोटाश, बोरेक्स (50 ग्राम/पेड़) व मैग्नीशियम सल्फेट दें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 180,
        name: {
          en: 'Nut Ripening & Seasonal Harvest',
          kn: 'ಕಾಯಿ ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'फल पकना एवं तुड़ाई',
        },
        irrigation: {
          en: 'Continue steady dry-season drip while avoiding wet-weather crown rot (apply Bordeaux/bio-control if rainy).',
          kn: 'ಒಣ ಹವಾಮಾನದಲ್ಲಿ ನಿಯಮಿತ ಹನಿ ನೀರಾವರಿ ಮುಂದುವರಿಸಿ; ಮಳೆಗಾಲದಲ್ಲಿ ಕೊಳೆರೋಗ ತಡೆಯಲು ಮುಂಜಾಗ್ರತೆ ವಹಿಸಿ.',
          hi: 'सूखे मौसम में ड्रिप जारी रखें; बारिश में सड़न रोग से बचाव हेतु जैव/बोर्डो सुरक्षा अपनाएं।',
        },
        nutrition: {
          en: 'Harvest mature bunches at 75–85% orange-yellow turn (areca) or 11–12 month dry/tender coconut cycle.',
          kn: 'ಅಡಿಕೆ ಶೇ. 75–85 ಕೇಸರಿ-ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಅಥವಾ ತೆಂಗು ಪಕ್ವವಾದಾಗ ಗೊನೆಗಳನ್ನು ಕತ್ತರಿಸಿ ಒಣಗಿಸಿ.',
          hi: 'सुपारी के 75–85% नारंगी-पीला होने या नारियल के पकने पर गुच्छों की तुड़ाई करें।',
        },
      },
    ],
  },
  banana: {
    iconName: 'fruit-cherries',
    defaultTotalDays: 300,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 45,
        name: {
          en: 'Planting & Root Establishment',
          kn: 'ಸಸಿ ನಾಟಿ ಮತ್ತು ಬೇರು ಸ್ಥಾಪನೆ',
          hi: 'रोपाई एवं जड़ स्थापना',
        },
        irrigation: {
          en: 'Keep pit soil moist with light drip every 2 days; protect young tissue-culture plants from standing water.',
          kn: 'ಪ್ರತಿ 2 ದಿನಕ್ಕೊಮ್ಮೆ ಲಘು ಹನಿ ನೀರಾವರಿ ನೀಡಿ; ಎಳೆ ಸಸಿಗಳ ಗುಂಡಿಯಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'हर 2 दिन हल्का ड्रिप पानी दें; नए पौधों के गड्ढों में पानी न रुकने दें।',
        },
        nutrition: {
          en: 'Dip suckers/root plugs in BSJDK Beejamrutha; fill pits with 10 kg compost + 250 g neem cake + bio-fertilizers.',
          kn: 'ಸಸಿಗಳನ್ನು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಲ್ಲಿ ಅದ್ದಿ ನೆಡಿ; ಗುಂಡಿಗಳಿಗೆ 10 ಕೆಜಿ ಕಾಂಪೋಸ್ಟ್, 250 ಗ್ರಾಂ ಬೇವಿನ ಹಿಂಡಿ ಮತ್ತು ಜೈವಿಕ ಗೊಬ್ಬರ ತುಂಬಿ.',
          hi: 'पौधों को BSJDK बीजामृत से उपचारित कर लगाएं; गड्ढों में 10 किग्रा कम्पोस्ट, 250 ग्राम नीम खली व जैव उर्वरक डालें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 145,
        name: {
          en: 'Leaf & Pseudostem Growth (BSJDK)',
          kn: 'ಎಲೆ ಮತ್ತು ಕಾಂಡ ಬೆಳವಣಿಗೆ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'पत्ती एवं तना विकास (BSJDK)',
        },
        irrigation: {
          en: 'Provide 15–20 L/plant/day via drip under dried trash mulch as broad leaves transpire heavily.',
          kn: 'ಬಾಳೆ ಎಲೆಗಳಿಂದ ಆವಿ ಹೆಚ್ಚಾಗುವುದರಿಂದ ಮಲ್ಚಿಂಗ್ ಕೆಳಗೆ ಪ್ರತಿ ಗಿಡಕ್ಕೆ ದಿನಕ್ಕೆ 15–20 ಲೀ. ಹನಿ ನೀರು ನೀಡಿ.',
          hi: 'चौड़ी पत्तियों से अधिक वाष्पीकरण के कारण मल्च के नीचे प्रति पौधा 15–20 लीटर/दिन ड्रिप सिंचाई दें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 2–3 L BSJDK JeevaDhara per plant every 15 days + 2 kg Ghanajeevamrutha/vermicompost; perform regular desuckering of side shoots.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ 15 ದಿನಕ್ಕೊಮ್ಮೆ ಪ್ರತಿ ಗಿಡಕ್ಕೆ 2–3 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಮತ್ತು 2 ಕೆಜಿ ಘನಜೀವಾಮೃತ/ಎರೆಗೊಬ್ಬರ ನೀಡಿ; ಪಕ್ಕದ ಅನಗತ್ಯ ಮರಿಗಳನ್ನು ತೆಗೆಯಿರಿ.',
          hi: 'BSJDK चरण 2: हर 15 दिन में प्रति पौधा 2–3 लीटर BSJDK जीवधारा व 2 किग्रा घनजीवामृत/केंचुआ खाद दें; अतिरिक्त बगल के कल्लों की छंटाई करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 240,
        name: {
          en: 'Shooting, Bunch Emergence & Finger Fill',
          kn: 'ಗೊನೆ ಹೊರಬರುವಿಕೆ ಮತ್ತು ಕಾಯಿ ದಪ್ಪವಾಗುವಿಕೆ',
          hi: 'घौद निकलना एवं फल भराव',
        },
        irrigation: {
          en: 'Peak moisture demand (22–28 L/plant/day)! Moisture deficit shrinks finger size and delays bunch filling.',
          kn: 'ಅತ್ಯಧಿಕ ನೀರಿನ ಅಗತ್ಯ (22–28 ಲೀ./ಗಿಡ/ದಿನ)! ನೀರು ಕಡಿಮೆಯಾದರೆ ಕಾಯಿ ಸಣ್ಣದಾಗುತ್ತವೆ.',
          hi: 'सर्वाधिक पानी की आवश्यकता (22–28 लीटर/पौधा/दिन)! नमी की कमी से केले का आकार छोटा रह जाता है।',
        },
        nutrition: {
          en: 'Boost Potassium & Micronutrients with BSJDK JeevaDhara; remove male bud after last hand opens and prop heavy bunches.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಜೊತೆ ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶ ನೀಡಿ; ಕೊನೆಯ ಹಣೆ ಬಿಟ್ಟ ನಂತರ ಗಂಡು ಹೂವು ತೆಗೆದು ಬೊಂಬು ಆಸರೆ ಕಟ್ಟಿ.',
          hi: 'BSJDK जीवधारा के साथ पोटाश व सूक्ष्म पोषक दें; आखिरी पंजा खुलने के बाद नर फूल हटाकर बांस का सहारा लगाएं।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 300,
        name: {
          en: 'Bunch Maturity & Harvest',
          kn: 'ಗೊನೆ ಪಕ್ವತೆ ಮತ್ತು ಕಟಾವು',
          hi: 'घौद परिपक्वता एवं कटाई',
        },
        irrigation: {
          en: 'Ease watering slightly 7–10 days before cutting to prevent finger splitting during handling.',
          kn: 'ಕಟಾವಿನ ವೇಳೆ ಹಣ್ಣು ಸೀಳುವುದನ್ನು ತಪ್ಪಿಸಲು 7–10 ದಿನ ಮೊದಲು ನೀರಿನ ಪ್ರಮಾಣ ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.',
          hi: 'कटाई के दौरान फल फटने से रोकने के लिए 7–10 दिन पहले पानी थोड़ा कम कर दें।',
        },
        nutrition: {
          en: 'Harvest when finger angles round out and floral ends dry cleanly; retain one healthy follower sucker.',
          kn: 'ಕಾಯಿಗಳ ಮೂಲೆಗಳು ದುಂಡಾಗಿ ತುದಿ ಒಣಗಿದಾಗ ಗೊನೆ ಕತ್ತರಿಸಿ; ಮುಂದಿನ ಬೆಳೆಗೆ ಒಂದು ಆರೋಗ್ಯಕರ ಮರಿ ಉಳಿಸಿಕೊಳ್ಳಿ.',
          hi: 'केलों के कोने गोल होने और फूलों का सिरा सूखने पर कटाई करें; अगली फसल के लिए एक स्वस्थ कल्ला छोड़ें।',
        },
      },
    ],
  },
};

const CATEGORY_TEMPLATES: Record<
  'cereal' | 'pulse' | 'vegetable' | 'cash' | 'plantation' | 'general',
  CropTemplate
> = {
  cereal: {
    iconName: 'barley',
    defaultTotalDays: 105,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 18,
        name: {
          en: 'Germination & Stand Establishment',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಆರಂಭಿಕ ಸ್ಥಾಪನೆ',
          hi: 'अंकुरण एवं पौध स्थापना',
        },
        irrigation: {
          en: 'Maintain light topsoil moisture for uniform emergence; prevent crusting and waterlogging.',
          kn: 'ಸಮವಾದ ಮೊಳಕೆಗೆ ಮೇಲ್ಮಣ್ಣಿನಲ್ಲಿ ಲಘು ತೇವಾಂಶ ಕಾಪಾಡಿ; ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'समान अंकुरण के लिए ऊपरी मिट्टी में हल्की नमी बनाए रखें; जलभराव से बचाएं।',
        },
        nutrition: {
          en: 'Treat seeds with BSJDK Beejamrutha; apply well-decomposed compost and basal Phosphorus at sowing.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ; ಬಿತ್ತನೆ ವೇಳೆ ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ರಂಜಕ ನೀಡಿ.',
          hi: 'BSJDK बीजामृत से बीज उपचार करें; बुआई के समय कम्पोस्ट व बेसल फॉस्फोरस दें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 48,
        name: {
          en: 'Tillering & Canopy Build (BSJDK)',
          kn: 'ತೆಂಡೆ ಮತ್ತು ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'कल्ले निकलना एवं वानस्पतिक वृद्धि (BSJDK)',
        },
        irrigation: {
          en: 'Irrigate every 10–14 days in dry spells; complete hoeing and intercultivation to hold soil moisture.',
          kn: 'ಒಣ ಹವಾಮಾನದಲ್ಲಿ 10–14 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರು ನೀಡಿ; ತೇವಾಂಶ ಉಳಿಸಲು ಎಡೆಕುಂಟೆ ಹೊಡೆಯಿರಿ.',
          hi: 'सूखे में हर 10–14 दिन पर सिंचाई करें; नमी संजोने के लिए निराई-गुड़ाई पूरी करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 150–200 L/acre BSJDK JeevaDhara bio-culture + apply 100 kg Ghanajeevamrutha/vermicompost for vigorous stem and leaf growth.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಬಲಿಷ್ಠ ಕಾಂಡ ಮತ್ತು ಎಲೆಗಳಿಗಾಗಿ ಎಕರೆಗೆ 150–200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಹಾಗೂ 100 ಕೆಜಿ ಘನಜೀವಾಮೃತ/ಎರೆಗೊಬ್ಬರ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: मजबूत तने और पत्तियों के लिए 150–200 लीटर/एकड़ BSJDK जीवधारा व 100 किग्रा घनजीवामृत/केंचुआ खाद का प्रयोग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 80,
        name: {
          en: 'Booting, Flowering & Grain Set',
          kn: 'ತೆನೆ ಹೊಡೆಯುವಿಕೆ ಮತ್ತು ಕಾಳು ಕಟ್ಟುವಿಕೆ',
          hi: 'बाली निकलना एवं दाना बनना',
        },
        irrigation: {
          en: 'Critical moisture stage! Ensure reliable watering during panicle/ear emergence and pollination.',
          kn: 'ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ಹಂತ! ತೆನೆ ಹೊರಬರುವಾಗ ಮತ್ತು ಪರಾಗಸ್ಪರ್ಶದ ವೇಳೆ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'अति महत्वपूर्ण अवस्था! बाली निकलते और परागण के समय नमी की कमी न होने दें।',
        },
        nutrition: {
          en: 'Spray diluted BSJDK JeevaDhara (1:10) + Potash for bold seed weight and strong stalks.',
          kn: 'ದಪ್ಪ ಕಾಳು ಮತ್ತು ಗಟ್ಟಿ ದಂಟುಗಳಿಗಾಗಿ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ (1:10) ಹಾಗೂ ಪೊಟ್ಯಾಶ್ ಸಿಂಪಡಿಸಿ.',
          hi: 'मोटे दानों और मजबूत डंठल के लिए पतला BSJDK जीवधारा (1:10) व पोटाश छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 105,
        name: {
          en: 'Grain Ripening & Harvest',
          kn: 'ಕಾಳು ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'दाना पकना एवं कटाई',
        },
        irrigation: {
          en: 'Stop irrigation 10–14 days before harvest so grain dries evenly on the stalk.',
          kn: 'ಕಾಳುಗಳು ಸಮವಾಗಿ ಒಣಗಲು ಕೊಯ್ಲಿಗೆ 10–14 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'दानों को समान रूप से सुखाने के लिए कटाई से 10–14 दिन पहले सिंचाई रोक दें।',
        },
        nutrition: {
          en: 'Harvest at physiological maturity in sunny weather and sun-dry to 12% moisture.',
          kn: 'ಬಿಸಿಲು ಇರುವಾಗ ಪಕ್ವವಾದ ಬೆಳೆ ಕೊಯ್ಲು ಮಾಡಿ ಶೇ. 12 ತೇವಾಂಶಕ್ಕೆ ಒಣಗಿಸಿ.',
          hi: 'साफ़ धूप वाले दिन पकी फसल काटें और 12% नमी तक सुखाकर भंडारित करें।',
        },
      },
    ],
  },
  pulse: {
    iconName: 'sprout-outline',
    defaultTotalDays: 100,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 16,
        name: {
          en: 'Germination & Root Nodulation',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಬೇರು ಗಂಟು ಹಂತ',
          hi: 'अंकुरण एवं जड़ गांठ बनना',
        },
        irrigation: {
          en: 'Pulses dislike wet feet — ensure good drainage and light germination moisture only.',
          kn: 'ಬೇಳೆಕಾಳುಗಳಿಗೆ ನೀರು ನಿಲ್ಲುವುದು ಒಳ್ಳೆಯದಲ್ಲ — ಉತ್ತಮ ಬಸಿಕಾಲುವೆ ಮತ್ತು ಲಘು ತೇವಾಂಶ ಮಾತ್ರ ಇರಲಿ.',
          hi: 'दलहनी फसलों को जलभराव पसंद नहीं — अच्छी जल निकासी और हल्की नमी ही रखें।',
        },
        nutrition: {
          en: 'Treat seeds with BSJDK Beejamrutha + crop-specific Rhizobium & PSB bio-inoculants.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತ, ರೈಜೋಬಿಯಂ ಮತ್ತು ಪಿಎಸ್‌ಬಿ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
          hi: 'BSJDK बीजामृत, राइजोबियम और PSB जैव-टीके से बीज उपचार करें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 44,
        name: {
          en: 'Branching & Pre-Flowering (BSJDK)',
          kn: 'ಕವಲು ಮತ್ತು ಹೂಮೊಗ್ಗು ಪೂರ್ವ ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'शाखाएं एवं पूर्व-पुष्पन (BSJDK)',
        },
        irrigation: {
          en: 'Irrigate lightly only during prolonged dry weather; over-watering lowers root nodule activity.',
          kn: 'ದೀರ್ಘ ಒಣ ಹವೆ ಇದ್ದರೆ ಮಾತ್ರ ಲಘು ನೀರು ನೀಡಿ; ಅತಿ ನೀರು ಬೇರು ಗಂಟುಗಳ ಸಕ್ರಿಯತೆ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
          hi: 'लंबे सूखे में ही हल्की सिंचाई करें; अधिक पानी से जड़ की गांठें कमजोर पड़ती हैं।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 150 L/acre BSJDK JeevaDhara to energize Rhizobium root nodules + foliar spray of 5% Neemarka against early pod-borer eggs.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಬೇರು ಗಂಟುಗಳ ಶಕ್ತಿ ಹೆಚ್ಚಿಸಲು ಎಕರೆಗೆ 150 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ನೀಡಿ ಮತ್ತು ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ ಶೇ. 5 ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.',
          hi: 'BSJDK चरण 2: राइजोबियम गांठों की सक्रियता बढ़ाने के लिए 150 लीटर/एकड़ BSJDK जीवधारा दें और कीट रोकथाम हेतु 5% नीमार्क छिड़कें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 78,
        name: {
          en: 'Flowering & Pod Development',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ ಬೆಳವಣಿಗೆ',
          hi: 'फूल आना एवं फली विकास',
        },
        irrigation: {
          en: 'Provide one critical irrigation at flowering initiation and another at pod-filling stage.',
          kn: 'ಹೂ ಬಿಡುವ ಆರಂಭದಲ್ಲಿ ಒಂದು ಮತ್ತು ಕಾಯಿ ತುಂಬುವ ಹಂತದಲ್ಲಿ ಮತ್ತೊಂದು ನಿರ್ಣಾಯಕ ನೀರಾವರಿ ನೀಡಿ.',
          hi: 'फूल आने की शुरुआत में एक और फली भरते समय दूसरी महत्वपूर्ण सिंचाई दें।',
        },
        nutrition: {
          en: 'Spray BSJDK JeevaDhara + 0.1% Boron/Sulphur for heavy pod set and less flower drop.',
          kn: 'ಹೂವು ಉದುರದಂತೆ ಮತ್ತು ಹೆಚ್ಚು ಕಾಯಿ ಕಟ್ಟಲು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ + ಬೋರಾನ್/ಗಂಧಕ ಸಿಂಪಡಿಸಿ.',
          hi: 'फूल झड़ने से रोकने और अधिक फलियों के लिए BSJDK जीवधारा + बोरॉन/गंधक का छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 100,
        name: {
          en: 'Pod Maturity & Harvest',
          kn: 'ಕಾಯಿ ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'फली पकना एवं कटाई',
        },
        irrigation: {
          en: 'Withdraw irrigation as pods turn brown/yellow so pods dry without shattering.',
          kn: 'ಕಾಯಿಗಳು ಹಳದಿ-ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿದಾಗ ನೀರು ನಿಲ್ಲಿಸಿ; ಕಾಯಿ ಒಡೆದು ಕಾಳು ಚೆಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'फलियां पीली-भूरी होने पर सिंचाई बंद करें ताकि फलियां चटककर दाने न झड़ें।',
        },
        nutrition: {
          en: 'Harvest at 80% dry pods in early morning hours to minimize shattering loss.',
          kn: 'ಶೇ. 80 ಕಾಯಿಗಳು ಒಣಗಿದಾಗ ಬೆಳಗಿನ ತಂಪಾದ ವೇಳೆ ಕೊಯ್ಲು ಮಾಡಿ ನಷ್ಟ ತಪ್ಪಿಸಿ.',
          hi: '80% फलियां सूखने पर सुबह के समय कटाई करें ताकि दाने झड़ने का नुकसान न हो।',
        },
      },
    ],
  },
  vegetable: {
    iconName: 'leaf',
    defaultTotalDays: 105,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 20,
        name: {
          en: 'Nursery / Sowing & Root Set',
          kn: 'ಸಸಿ ಮಡಿ / ಬಿತ್ತನೆ ಮತ್ತು ಬೇರು ಸ್ಥಾಪನೆ',
          hi: 'रोपाई / बुआई एवं जड़ स्थापना',
        },
        irrigation: {
          en: 'Give gentle frequent moisture on raised beds or drip lines; prevent soil crusting over seeds.',
          kn: 'ಏರುಮಡಿ ಅಥವಾ ಹನಿ ನೀರಾವರಿಯಲ್ಲಿ ಲಘು, ನಿಯಮಿತ ತೇವಾಂಶ ನೀಡಿ; ಬೀಜದ ಮೇಲೆ ಮಣ್ಣು ಗಟ್ಟಿಯಾಗದಿರಲಿ.',
          hi: 'उठी क्यारियों या ड्रिप से हल्की नियमित नमी दें; बीजों पर पपड़ी न जमने दें।',
        },
        nutrition: {
          en: 'Seed/root dip with BSJDK Beejamrutha; mix fine vermicompost + Trichoderma into top bed soil.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜ/ಬೇರು ಉಪಚಾರ ಮಾಡಿ; ಮಡಿಗಳಲ್ಲಿ ಎರೆಹುಳು ಗೊಬ್ಬರ ಮತ್ತು ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ.',
          hi: 'BSJDK बीजामृत से बीज/जड़ उपचार करें; क्यारी की ऊपरी मिट्टी में केंचुआ खाद व ट्राइकोडर्मा मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 48,
        name: {
          en: 'Foliage Growth & BSJDK Bio-Care',
          kn: 'ಎಲೆ ಬೆಳವಣಿಗೆ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ',
          hi: 'पत्ती विकास एवं BSJDK देखभाल',
        },
        irrigation: {
          en: 'Irrigate every 3–5 days (drip every 2 days) and mulch inter-rows to keep root temperature cool.',
          kn: 'ಪ್ರತಿ 3–5 ದಿನಕ್ಕೊಮ್ಮೆ (2 ದಿನಕ್ಕೊಮ್ಮೆ ಹನಿ) ನೀರು ನೀಡಿ; ಬೇರು ತಂಪಾಗಿಡಲು ಸಾವಯವ ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.',
          hi: 'हर 3–5 दिन (या 2 दिन पर ड्रिप) सिंचाई करें; जड़ों को ठंडा रखने के लिए मल्चिंग करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 150 L/acre BSJDK JeevaDhara every 14 days + side-dress enriched compost/Ghanajeevamrutha; inspect undersides of leaves for pests.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ 14 ದಿನಕ್ಕೊಮ್ಮೆ ಎಕರೆಗೆ 150 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಮತ್ತು ಸಮೃದ್ಧ ಕಾಂಪೋಸ್ಟ್/ಘನಜೀವಾಮೃತ ನೀಡಿ; ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಕೀಟ ಪರಿಶೀಲಿಸಿ.',
          hi: 'BSJDK चरण 2: हर 14 दिन में 150 लीटर/एकड़ BSJDK जीवधारा व समृद्ध कम्पोस्ट/घनजीवामृत दें; पत्तियों के नीचे कीट जांच करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 80,
        name: {
          en: 'Flowering, Fruiting & Bulking',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ/ಗಡ್ಡೆ ಬೆಳವಣಿಗೆ',
          hi: 'फूल आना एवं फल/कंद विकास',
        },
        irrigation: {
          en: 'Steady uniform watering is essential so tender vegetables develop uniform size and crisp texture.',
          kn: 'ತರಕಾರಿಗಳು ಸಮ ಗಾತ್ರ ಮತ್ತು ಗುಣಮಟ್ಟ ಪಡೆಯಲು ನಿರಂತರ, ಸಮತೋಲಿತ ನೀರು ಅಗತ್ಯ.',
          hi: 'सब्जियों के समान आकार और गुणवत्ता के लिए नियमित व संतुलित सिंचाई आवश्यक है।',
        },
        nutrition: {
          en: 'Foliar spray of BSJDK JeevaDhara (1:10) + Calcium/Boron/Potash nutrition for bright market quality.',
          kn: 'ಉತ್ತಮ ಬಣ್ಣ ಮತ್ತು ಗಾತ್ರಕ್ಕಾಗಿ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ (1:10) ಹಾಗೂ ಕ್ಯಾಲ್ಸಿಯಂ/ಬೋರಾನ್/ಪೊಟ್ಯಾಶ್ ಸಿಂಪಡಿಸಿ.',
          hi: 'बेहतर रंग और बाजार गुणवत्ता के लिए BSJDK जीवधारा (1:10) व कैल्शियम/बोरॉन/पोटाश छिड़कें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 105,
        name: {
          en: 'Market Maturity & Picking',
          kn: 'ಮಾರುಕಟ್ಟೆ ಪಕ್ವತೆ ಮತ್ತು ಕಟಾವು',
          hi: 'परिपक्वता एवं तुड़ाई',
        },
        irrigation: {
          en: 'Give light irrigation after each harvest picking; withhold excess water right before harvest of root/bulb crops.',
          kn: 'ಪ್ರತಿ ಕೊಯ್ಲಿನ ನಂತರ ಲಘು ನೀರು ನೀಡಿ; ಗೆಡ್ಡೆ ಬೆಳೆಗಳಾಗಿದ್ದರೆ ಕೀಳುವ ಕೆಲವು ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'प्रत्येक तुड़ाई के बाद हल्का पानी दें; जड़/कंद वाली फसलों में खुदाई से कुछ दिन पहले पानी बंद करें।',
        },
        nutrition: {
          en: 'Harvest tender/mature produce in cool morning hours and shade-cool immediately for freshness.',
          kn: 'ಬೆಳಗಿನ ತಂಪಾದ ವೇಳೆ ಕಟಾವು ಮಾಡಿ, ತಾಜಾತನ ಉಳಿಸಲು ತಕ್ಷಣ ನೆರಳಿನಲ್ಲಿ ತಂಪಾಗಿಡಿ.',
          hi: 'सुबह ठंडे समय में तुड़ाई करें और ताज़गी बनाए रखने के लिए तुरंत छाया में रखें।',
        },
      },
    ],
  },
  cash: {
    iconName: 'flower-outline',
    defaultTotalDays: 120,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 20,
        name: {
          en: 'Germination & Early Root',
          kn: 'ಮೊಳಕೆ ಮತ್ತು ಆರಂಭಿಕ ಬೇರು',
          hi: 'अंकुरण एवं प्रारंभिक जड़',
        },
        irrigation: {
          en: 'Light furrow irrigation for uniform emergence; prevent soil crusting.',
          kn: 'ಸಮವಾದ ಮೊಳಕೆಗೆ ಸಾಲುಗಳಲ್ಲಿ ಲಘು ನೀರು ನೀಡಿ; ಮಣ್ಣು ಗಟ್ಟಿಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
          hi: 'समान अंकुरण के लिए नालियों में हल्की सिंचाई करें; पपड़ी न जमने दें।',
        },
        nutrition: {
          en: 'BSJDK Beejamrutha seed treatment; basal FYM + Phosphorus + Sulphur for oil/cash crops.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ; ಎಣ್ಣೆಕಾಳು/ವಾಣಿಜ್ಯ ಬೆಳೆಗೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ, ರಂಜಕ ಮತ್ತು ಗಂಧಕ ನೀಡಿ.',
          hi: 'BSJDK बीजामृत से बीज उपचार करें; तिलहन/नकदी फसलों के लिए गोबर खाद, फॉस्फोरस व गंधक डालें।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 52,
        name: {
          en: 'Vegetative & Bud Formation (BSJDK)',
          kn: 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ಮೊಗ್ಗು ಹಂತ (ಬಿಎಸ್‌ಜೆಡಿಕೆ)',
          hi: 'वानस्पतिक वृद्धि एवं कली बनना (BSJDK)',
        },
        irrigation: {
          en: 'Provide 1–2 timely irrigations during active branching and stem elongation.',
          kn: 'ಕವಲು ಮತ್ತು ಕಾಂಡ ಬೆಳೆಯುವಾಗ 1–2 ಬಾರಿ ಸಮಯೋಚಿತ ನೀರಾವರಿ ನೀಡಿ.',
          hi: 'शाखाएं और तना बढ़ते समय 1–2 समयबद्ध सिंचाई दें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 200 L/acre BSJDK JeevaDhara + apply 100 kg Ghanajeevamrutha/neem cake during hoeing and earthing-up.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಎಡೆಕುಂಟೆ/ಮಣ್ಣು ಏರಿಸುವಾಗ ಎಕರೆಗೆ 200 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಮತ್ತು 100 ಕೆಜಿ ಘನಜೀವಾಮೃತ/ಬೇವಿನ ಹಿಂಡಿ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: गुड़ाई व मिट्टी चढ़ाते समय 200 लीटर/एकड़ BSJDK जीवधारा व 100 किग्रा घनजीवामृत/नीम खली का प्रयोग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 92,
        name: {
          en: 'Flowering & Seed/Oil Filling',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಬೀಜ/ಎಣ್ಣೆ ತುಂಬುವ ಹಂತ',
          hi: 'फूल आना एवं दाना/तेल भराव',
        },
        irrigation: {
          en: 'Critical moisture stage! Avoid water stress during pollination and seed filling; protect pollinators by spraying only late evening if needed.',
          kn: 'ನಿರ್ಣಾಯಕ ಹಂತ! ಪರಾಗಸ್ಪರ್ಶ ಮತ್ತು ಬೀಜ ತುಂಬುವಾಗ ತೇವಾಂಶ ಕಾಪಾಡಿ; ಜೇನುನೊಣ ರಕ್ಷಣೆಗೆ ಅಗತ್ಯ ಸಿಂಪಡಣೆಯನ್ನು ಸಂಜೆ ಮಾತ್ರ ಮಾಡಿ.',
          hi: 'महत्वपूर्ण अवस्था! परागण और दाना भरते समय नमी बनाए रखें; मधुमक्खियों की सुरक्षा के लिए छिड़काव केवल शाम को करें।',
        },
        nutrition: {
          en: 'Supplement Boron (0.1–0.2%) + Sulphur + BSJDK JeevaDhara foliar spray for high seed/oil density.',
          kn: 'ಹೆಚ್ಚು ಬೀಜ ಮತ್ತು ಎಣ್ಣೆ ಅಂಶಕ್ಕಾಗಿ ಬೋರಾನ್ (0.1–0.2%), ಗಂಧಕ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಸಿಂಪಡಿಸಿ.',
          hi: 'अधिक दाने और तेल प्रतिशत के लिए बोरॉन (0.1–0.2%), गंधक व BSJDK जीवधारा का छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 120,
        name: {
          en: 'Crop Maturity & Harvest',
          kn: 'ಬೆಳೆ ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'फसल परिपक्वता एवं कटाई',
        },
        irrigation: {
          en: 'Stop irrigation 12–14 days before harvest so heads/pods dry uniformly.',
          kn: 'ಬೆಳೆ ಸಮವಾಗಿ ಒಣಗಲು ಕೊಯ್ಲಿಗೆ 12–14 ದಿನ ಮೊದಲು ನೀರು ನಿಲ್ಲಿಸಿ.',
          hi: 'फसल एक समान सूखने के लिए कटाई से 12–14 दिन पहले सिंचाई बंद करें।',
        },
        nutrition: {
          en: 'Harvest cleanly at physiological maturity and dry thoroughly to <9% moisture (oilseeds) before bagging.',
          kn: 'ಪಕ್ವವಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ ಚೀಲ ತುಂಬುವ ಮುನ್ನ ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ.',
          hi: 'पूर्ण पकने पर कटाई करें और बोरी में भरने से पहले अच्छी तरह सुखाएं।',
        },
      },
    ],
  },
  plantation: {
    iconName: 'tree-outline',
    defaultTotalDays: 180,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 35,
        name: {
          en: 'Basin Prep & Pruning Phase',
          kn: 'ಪಾತಿ ಸಿದ್ಧತೆ ಮತ್ತು ಕತ್ತರಿಸುವ ಹಂತ',
          hi: 'थाला तैयारी एवं छंटाई चरण',
        },
        irrigation: {
          en: 'Resume light drip irrigation around feeder root zone after pruning/rest period.',
          kn: 'ಕತ್ತರಿಸುವಿಕೆ/ವಿಶ್ರಾಂತಿ ಅವಧಿಯ ನಂತರ ಬೇರು ವಲಯದ ಸುತ್ತ ಲಘು ಹನಿ ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಿ.',
          hi: 'छंटाई/विश्राम के बाद जड़ क्षेत्र के चारों ओर हल्की ड्रिप सिंचाई शुरू करें।',
        },
        nutrition: {
          en: 'Incorporate farm compost + Trichoderma + neem cake into circular tree basins.',
          kn: 'ಮರದ ಸುತ್ತಲಿನ ಪಾತಿಗಳಲ್ಲಿ ಕಾಂಪೋಸ್ಟ್, ಟ್ರೈಕೋಡರ್ಮಾ ಮತ್ತು ಬೇವಿನ ಹಿಂಡಿ ಬೆರೆಸಿ.',
          hi: 'पेड़ के गोलाकार थालों में कम्पोस्ट, ट्राइकोडर्मा व नीम खली मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 85,
        name: {
          en: 'New Flush & BSJDK Orchard Care',
          kn: 'ಹೊಸ ಚಿಗುರು ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ತೋಟದ ಆರೈಕೆ',
          hi: 'नई कोपलें एवं BSJDK बागवानी पोषण',
        },
        irrigation: {
          en: 'Maintain even soil moisture under organic mulch cover; avoid sudden heavy flooding.',
          kn: 'ಸಾವಯವ ಹೊದಿಕೆಯ ಕೆಳಗೆ ಸಮತೋಲಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ; ಏಕಾಏಕಿ ಅತಿಯಾದ ನೀರು ಹರಿಸಬೇಡಿ.',
          hi: 'जैविक मल्च के नीचे समान नमी बनाए रखें; अचानक अधिक जलभराव से बचें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 5–10 L BSJDK JeevaDhara per tree basin + apply Ghanajeevamrutha/vermicompost and mulch with dry orchard leaves.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ಪ್ರತಿ ಗಿಡ/ಮರದ ಬುಡಕ್ಕೆ 5–10 ಲೀ. ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ದ್ರವ ಮತ್ತು ಘನಜೀವಾಮೃತ/ಎರೆಗೊಬ್ಬರ ನೀಡಿ ಒಣ ಎಲೆಗಳ ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.',
          hi: 'BSJDK चरण 2: प्रति पौधा/पेड़ थाले में 5–10 लीटर BSJDK जीवधारा व घनजीवामृत/केंचुआ खाद डालकर सूखे पत्तों से मल्चिंग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 140,
        name: {
          en: 'Flowering, Fruit Set & Sizing',
          kn: 'ಹೂವಾಡುವಿಕೆ, ಕಾಯಿ ಕಟ್ಟುವಿಕೆ ಮತ್ತು ಗಾತ್ರ ಬೆಳವಣಿಗೆ',
          hi: 'फूल आना, फल लगना एवं आकार बढ़ना',
        },
        irrigation: {
          en: 'Consistent regulated drip watering prevents fruit drop and supports uniform fruit sizing.',
          kn: 'ನಿಯಮಿತ ಹನಿ ನೀರಾವರಿಯಿಂದ ಕಾಯಿ ಉದುರುವಿಕೆ ತಪ್ಪಿ ಹಣ್ಣುಗಳು ಸಮ ಗಾತ್ರದಲ್ಲಿ ಬೆಳೆಯುತ್ತವೆ.',
          hi: 'नियमित ड्रिप सिंचाई से फल झड़ना रुकता है और आकार एक समान बढ़ता है।',
        },
        nutrition: {
          en: 'Supply Potash + Calcium + Boron micronutrients along with BSJDK JeevaDhara bio-spray.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಸಿಂಪಡಣೆಯೊಂದಿಗೆ ಪೊಟ್ಯಾಶ್, ಕ್ಯಾಲ್ಸಿಯಂ ಮತ್ತು ಬೋರಾನ್ ಲಘು ಪೋಷಕಾಂಶ ನೀಡಿ.',
          hi: 'BSJDK जीवधारा छिड़काव के साथ पोटाश, कैल्शियम व बोरॉन सूक्ष्म पोषक तत्व दें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 180,
        name: {
          en: 'Ripening & Orchard Harvest',
          kn: 'ಹಣ್ಣಾಗುವಿಕೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'फल पकना एवं तुड़ाई',
        },
        irrigation: {
          en: 'Reduce irrigation slightly near harvest for higher sugar/Brix, aroma, and longer shelf life.',
          kn: 'ಹಣ್ಣಿನ ಸಿಹಿ, ಸುವಾಸನೆ ಮತ್ತು ಬಾಳಿಕೆ ಹೆಚ್ಚಿಸಲು ಕೊಯ್ಲಿನ ಸಮೀಪದಲ್ಲಿ ನೀರನ್ನು ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.',
          hi: 'मिठास, खुशबू और भंडारण क्षमता बढ़ाने के लिए तुड़ाई के करीब पानी थोड़ा कम करें।',
        },
        nutrition: {
          en: 'Pick carefully with stalks intact during cool morning hours and grade cleanly in shade.',
          kn: 'ಬೆಳಗಿನ ತಂಪಾದ ವೇಳೆಯಲ್ಲಿ ತೊಟ್ಟು ಸಮೇತ ಎಚ್ಚರಿಕೆಯಿಂದ ಕೊಯ್ಲು ಮಾಡಿ ನೆರಳಿನಲ್ಲಿ ವಿಂಗಡಿಸಿ.',
          hi: 'सुबह ठंडे समय में डंठल सहित सावधानी से तुड़ाई करें और छाया में छंटाई करें।',
        },
      },
    ],
  },
  general: {
    iconName: 'sprout-outline',
    defaultTotalDays: 120,
    stages: [
      {
        stageNumber: 1,
        category: 'Germination',
        endDay: 20,
        name: {
          en: 'Germination & Establishment',
          kn: 'ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ ಮತ್ತು ಸ್ಥಾಪನೆ',
          hi: 'अंकुरण एवं स्थापना',
        },
        irrigation: {
          en: 'Maintain light, uniform seedbed moisture; prevent soil crusting and standing water.',
          kn: 'ಬೀಜ ಸರಾಗವಾಗಿ ಮೊಳಕೆಯೊಡೆಯಲು ಮಣ್ಣಿನಲ್ಲಿ ಸಮತೋಲಿತ ಲಘು ತೇವಾಂಶ ಕಾಪಾಡಿ; ನೀರು ನಿಲ್ಲದಿರಲಿ.',
          hi: 'बीज के अच्छे अंकुरण के लिए खेत में हल्की व समान नमी बनाए रखें; जलभराव से बचें।',
        },
        nutrition: {
          en: 'Treat seeds/roots with BSJDK Beejamrutha; incorporate well-rotted FYM/compost into soil.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಬೀಜಾಮೃತದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ; ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಚೆನ್ನಾಗಿ ಕೊಳೆತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ/ಕಾಂಪೋಸ್ಟ್ ನೀಡಿ.',
          hi: 'BSJDK बीजामृत से बीज उपचार करें और बुआई के समय अच्छी सड़ी गोबर खाद/कम्पोस्ट मिलाएं।',
        },
      },
      {
        stageNumber: 2,
        category: 'Vegetative',
        endDay: 55,
        name: {
          en: 'Vegetative Growth (BSJDK Phase)',
          kn: 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ (ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ)',
          hi: 'वानस्पतिक वृद्धि (BSJDK चरण)',
        },
        irrigation: {
          en: 'Irrigate cleanly based on soil moisture every 7–10 days and mulch inter-rows to conserve moisture.',
          kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ನೋಡಿ 7–10 ದಿನಕ್ಕೊಮ್ಮೆ ನೀರುಣಿಸಿ ಮತ್ತು ತೇವಾಂಶ ಉಳಿಸಲು ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.',
          hi: 'मिट्टी की नमी देखकर हर 7–10 दिन में सिंचाई करें और नमी बचाने के लिए मल्चिंग करें।',
        },
        nutrition: {
          en: 'BSJDK Stage 2: Drench 200 L/acre Bhoomishakti JeevaDhara liquid bio-nutrient + apply Ghanajeevamrutha/vermicompost to build strong shoots and root microflora.',
          kn: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಹಂತ 2: ದೃಢವಾದ ಕಾಂಡ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆಗಾಗಿ ಎಕರೆಗೆ 200 ಲೀ. ಭೂಮಿಶಕ್ತಿ ಜೀವಧಾರಾ ದ್ರವ ಹಾಗೂ ಘನಜೀವಾಮೃತ/ಎರೆಗೊಬ್ಬರ ನೀಡಿ.',
          hi: 'BSJDK चरण 2: मजबूत शाखाओं और मिट्टी की उर्वरता के लिए 200 लीटर/एकड़ भूमि शक्ति जीवधारा तरल तथा घनजीवामृत/केंचुआ खाद का प्रयोग करें।',
        },
      },
      {
        stageNumber: 3,
        category: 'Flowering/Fruiting',
        endDay: 92,
        name: {
          en: 'Flowering & Fruit/Grain Filling',
          kn: 'ಹೂವಾಡುವಿಕೆ ಮತ್ತು ಕಾಯಿ/ಕಾಳು ತುಂಬುವಿಕೆ',
          hi: 'फूल आना एवं दाना/फल भराव',
        },
        irrigation: {
          en: 'Critical moisture phase! Prevent water stress in the root zone during flowering and grain/fruit set.',
          kn: 'ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ! ಹೂವು ಮತ್ತು ಕಾಯಿ ಉದುರದಂತೆ ಬೇರು ವಲಯದಲ್ಲಿ ನಿಯಮಿತ ತೇವಾಂಶ ಕಾಪಾಡಿ.',
          hi: 'अति संवेदनशील अवस्था! फूल व फल गिरने से रोकने के लिए जड़ क्षेत्र में निरंतर नमी बनाए रखें।',
        },
        nutrition: {
          en: 'Apply foliar spray of BSJDK JeevaDhara (1:10) + Potash & Micronutrients (Boron/Zinc) to boost yield.',
          kn: 'ಹೆಚ್ಚಿನ ಇಳುವರಿಗಾಗಿ ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ (1:10), ಪೊಟ್ಯಾಶ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳ (ಬೋರಾನ್/ಜಿಂಕ್) ಸಿಂಪಡಣೆ ಮಾಡಿ.',
          hi: 'अधिक उपज के लिए BSJDK जीवधारा (1:10), पोटाश एवं सूक्ष्म पोषक तत्वों (बोरॉन/जिंक) का पर्णीय छिड़काव करें।',
        },
      },
      {
        stageNumber: 4,
        category: 'Harvest',
        endDay: 120,
        name: {
          en: 'Maturity & Harvest',
          kn: 'ಪಕ್ವತೆ ಮತ್ತು ಕೊಯ್ಲು',
          hi: 'परिपक्वता एवं कटाई',
        },
        irrigation: {
          en: 'Gradually withdraw irrigation 10–14 days prior to harvest for uniform ripening.',
          kn: 'ಬೆಳೆ ಸಮವಾಗಿ ಪಕ್ವವಾಗಲು ಕೊಯ್ಲಿಗೆ 10–14 ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ನೀರುಣಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ.',
          hi: 'फसल के एक समान पकने के लिए कटाई से 10–14 दिन पूर्व सिंचाई रोक दें।',
        },
        nutrition: {
          en: 'Stop all nutrient feeds. Harvest at full maturity in clear weather and store cleanly.',
          kn: 'ಎಲ್ಲಾ ಗೊಬ್ಬರಗಳನ್ನು ನಿಲ್ಲಿಸಿ. ಸ್ವಚ್ಛ ಹವಾಮಾನದಲ್ಲಿ ಪಕ್ವವಾದ ಬೆಳೆಯನ್ನು ಕೊಯ್ಲು ಮಾಡಿ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಿ.',
          hi: 'सभी खाद प्रयोग बंद करें। साफ़ मौसम में पकी फसल की कटाई कर सुरक्षित भंडारण करें।',
        },
      },
    ],
  },
};

function matchesAny(lower: string, keywords: string[]): boolean {
  return keywords.some(kw => lower.includes(kw));
}

function resolveTemplateKey(rawCropName: string): { kind: 'crop' | 'category'; key: string; iconOverride?: CropIconName; defaultDaysOverride?: number } {
  const lower = rawCropName.toLowerCase().trim();
  if (!lower) return { kind: 'category', key: 'general' };

  // 12 dedicated Indian crop profiles
  if (matchesAny(lower, ['paddy', 'rice', 'ಭತ್ತ', 'ಅಕ್ಕಿ', 'धान', 'चावल', 'dhan', 'nellu', 'bhatta'])) {
    return { kind: 'crop', key: 'paddy' };
  }
  if (matchesAny(lower, ['ragi', 'finger millet', 'ರಾಗಿ', 'रागी', 'nachni', 'mandua'])) {
    return { kind: 'crop', key: 'ragi' };
  }
  if (matchesAny(lower, ['maize', 'corn', 'ಮೆಕ್ಕೆಜೋಳ', 'ಜೋಳ', 'मक्का', 'makka', 'bhutta'])) {
    // Note: jowar/sorghum checked below if specifically typed; 'ಜೋಳ' without 'ಮೆಕ್ಕೆ' could be jowar
    if (lower === 'ಜೋಳ' || lower.includes('jowar') || lower.includes('sorghum')) {
      return { kind: 'category', key: 'cereal', iconOverride: 'barley', defaultDaysOverride: 110 };
    }
    return { kind: 'crop', key: 'maize' };
  }
  if (matchesAny(lower, ['wheat', 'ಗೋಧಿ', 'गेहूं', 'गेहूँ', 'gehu', 'godhi'])) {
    return { kind: 'crop', key: 'wheat' };
  }
  if (matchesAny(lower, ['cotton', 'ಹತ್ತಿ', 'कपास', 'kapas', 'hatti'])) {
    return { kind: 'crop', key: 'cotton' };
  }
  if (matchesAny(lower, ['sugarcane', 'sugar cane', 'ಕಬ್ಬು', 'गन्ना', 'kabbu', 'ganna'])) {
    return { kind: 'crop', key: 'sugarcane' };
  }
  if (matchesAny(lower, ['tomato', 'ಟೊಮ್ಯಾಟೊ', 'ಟೊಮೆಟೊ', 'टमाटर', 'tamatar'])) {
    return { kind: 'crop', key: 'tomato' };
  }
  if (matchesAny(lower, ['chilli', 'chili', 'pepper', 'ಮೆಣಸಿನಕಾಯಿ', 'ಮೆಣಸು', 'मिर्च', 'mirchi'])) {
    if (lower.includes('black pepper') || lower.includes('ಕಾಳುಮೆಣಸು') || lower.includes('काली मिर्च')) {
      return { kind: 'category', key: 'plantation', iconOverride: 'leaf', defaultDaysOverride: 210 };
    }
    return { kind: 'crop', key: 'chilli' };
  }
  if (matchesAny(lower, ['onion', 'ಈರುಳ್ಳಿ', 'उल्ली', 'प्याज', 'प्याज़', 'pyaz', 'kanda', 'eerulli'])) {
    return { kind: 'crop', key: 'onion' };
  }
  if (matchesAny(lower, ['groundnut', 'peanut', 'ಶೇಂಗಾ', 'ಕಡಲೆಕಾಯಿ', 'ಕಡಲೇಕಾಯಿ', 'मूंगफली', 'moongfali', 'sheng'])) {
    return { kind: 'crop', key: 'groundnut' };
  }
  if (matchesAny(lower, ['arecanut', 'areca', 'coconut', 'supari', 'ಅಡಿಕೆ', 'ತೆಂಗು', 'ತೆಂಗಿನ', 'सुपारी', 'नारियल', 'adike', 'thengu', 'nariyal'])) {
    return { kind: 'crop', key: 'arecanut' };
  }
  if (matchesAny(lower, ['banana', 'plantain', 'ಬಾಳೆ', 'केला', 'bale', 'kela'])) {
    return { kind: 'crop', key: 'banana' };
  }

  // Smart categorization for any custom typed crop
  if (matchesAny(lower, ['jowar', 'sorghum', 'bajra', 'pearl millet', 'foxtail', 'barley', 'oats', 'millet', 'navane', 'sajje', 'ಸಿರಿಧಾನ್ಯ', 'ಸಜ್ಜೆ', 'ನವಣೆ', 'ज्वार', 'बाजरा', 'जौ', 'कोदो'])) {
    return { kind: 'category', key: 'cereal', iconOverride: 'barley', defaultDaysOverride: 105 };
  }
  if (matchesAny(lower, ['pulse', 'dal', 'daal', 'gram', 'tur', 'toor', 'arhar', 'moong', 'mung', 'urad', 'chana', 'chickpea', 'soy', 'cowpea', 'horsegram', 'lentil', 'ತೊಗರಿ', 'ಹೆಸರು', 'ಉದ್ದು', 'ಕಡಲೆ', 'ಅವರೆ', 'ಸೋಯಾ', 'ದಾಳ', 'दाल', 'अरहर', 'तूर', 'मूंग', 'उड़द', 'चना', 'सोयाबीन', 'मसूर'])) {
    return { kind: 'category', key: 'pulse', iconOverride: 'sprout-outline', defaultDaysOverride: 100 };
  }
  if (matchesAny(lower, ['ginger', 'turmeric', 'ಶುಂಠಿ', 'ಅರಿಶಿನ', 'अदरक', 'हल्दी'])) {
    return { kind: 'category', key: 'vegetable', iconOverride: 'spa-outline', defaultDaysOverride: 210 };
  }
  if (matchesAny(lower, ['potato', 'brinjal', 'eggplant', 'okra', 'bhindi', 'cabbage', 'cauliflower', 'beans', 'carrot', 'radish', 'gourd', 'cucumber', 'pumpkin', 'garlic', 'spinach', 'coriander', 'vegetable', 'ಬದನೆ', 'ಬೆಂಡೆ', 'ಆಲೂ', 'ಕೋಸು', 'ಹುರುಳಿ', 'ಸೌತೆ', 'ಕುಂಬಳ', 'ಬೆಳ್ಳುಳ್ಳಿ', 'ಸೊಪ್ಪು', 'ತರಕಾರಿ', 'आलू', 'बैंगन', 'भिंडी', 'गोभी', 'सेम', 'लौकी', 'खीरा', 'कद्दू', 'लहसुन', 'सब्जी', 'पालक'])) {
    const vegIcon: CropIconName =
      lower.includes('potato') || lower.includes('ಆಲೂ') || lower.includes('आलू') ? 'seed-outline' : 'leaf';
    return { kind: 'category', key: 'vegetable', iconOverride: vegIcon, defaultDaysOverride: 105 };
  }
  if (matchesAny(lower, ['sunflower', 'mustard', 'sesame', 'til', 'castor', 'safflower', 'soybean', 'tobacco', 'jute', 'oilseed', 'ಸೂರ್ಯಕಾಂತಿ', 'ಸಾಸಿವೆ', 'ಎಳ್ಳು', 'ಹರಳು', 'ತಂಬಾಕು', 'सूरजमुखी', 'सरसों', 'तिल', 'अरंडी', 'तंबाकू'])) {
    return { kind: 'category', key: 'cash', iconOverride: 'flower-outline', defaultDaysOverride: 120 };
  }
  if (matchesAny(lower, ['coffee', 'tea', 'mango', 'pomegranate', 'papaya', 'guava', 'grape', 'citrus', 'lemon', 'orange', 'cardamom', 'cashew', 'rubber', 'sapota', 'jackfruit', 'watermelon', 'काफी', 'ಕಾಫಿ', 'ಮಾವು', 'ದಾಳಿಂಬೆ', 'ಪಪ್ಪಾಯಿ', 'ಸೀಬೆ', 'ದ್ರಾಕ್ಷಿ', 'ನಿಂಬೆ', 'ಏಲಕ್ಕಿ', 'ಗೋಡಂಬಿ', 'आम', 'अनार', 'पपीता', 'अमरूद', 'अंगूर', 'नींबू', 'इलायची', 'काजू', 'कल्लंगडी'])) {
    const fruitIcon: CropIconName =
      lower.includes('mango') || lower.includes('ಮಾವು') || lower.includes('आम') ||
      lower.includes('grape') || lower.includes('ದ್ರಾಕ್ಷಿ') || lower.includes('अंगूर')
        ? 'fruit-cherries'
        : 'tree-outline';
    return { kind: 'category', key: 'plantation', iconOverride: fruitIcon, defaultDaysOverride: 180 };
  }

  return { kind: 'category', key: 'general' };
}

export function getCropIconName(name: string): CropIconName {
  const resolved = resolveTemplateKey(name);
  if (resolved.iconOverride) return resolved.iconOverride;
  if (resolved.kind === 'crop') {
    return CROP_TEMPLATES[resolved.key]?.iconName ?? 'sprout-outline';
  }
  return CATEGORY_TEMPLATES[resolved.key as keyof typeof CATEGORY_TEMPLATES]?.iconName ?? 'sprout-outline';
}

export function computeCropProfile(
  rawCropName: string,
  language: Language,
  customTotalDays?: number | null
): CropGrowthProfile {
  const cleanName = rawCropName.trim();
  const displayName = cleanName || (language === 'kn' ? 'ಬೆಳೆ' : language === 'hi' ? 'फसल' : 'Crop');
  const resolved = resolveTemplateKey(cleanName);
  const template =
    resolved.kind === 'crop'
      ? CROP_TEMPLATES[resolved.key]
      : CATEGORY_TEMPLATES[resolved.key as keyof typeof CATEGORY_TEMPLATES];

  const defaultTotalDays = resolved.defaultDaysOverride ?? template.defaultTotalDays;
  const iconName = resolved.iconOverride ?? template.iconName;

  const hasValidCustomTotal =
    typeof customTotalDays === 'number' &&
    Number.isFinite(customTotalDays) &&
    customTotalDays >= 20 &&
    customTotalDays <= 730;
  const targetTotalDays = hasValidCustomTotal ? Math.round(customTotalDays) : defaultTotalDays;

  const baseTotal = template.defaultTotalDays;
  const s1RawEnd = template.stages[0].endDay;
  const s2RawEnd = template.stages[1].endDay;
  const s3RawEnd = template.stages[2].endDay;

  let endDays: [number, number, number, number];
  if (targetTotalDays === baseTotal) {
    endDays = [s1RawEnd, s2RawEnd, s3RawEnd, baseTotal];
  } else {
    const s1End = Math.max(3, Math.min(targetTotalDays - 6, Math.round((s1RawEnd / baseTotal) * targetTotalDays)));
    const s2End = Math.max(s1End + 3, Math.min(targetTotalDays - 4, Math.round((s2RawEnd / baseTotal) * targetTotalDays)));
    const s3End = Math.max(s2End + 2, Math.min(targetTotalDays - 2, Math.round((s3RawEnd / baseTotal) * targetTotalDays)));
    endDays = [s1End, s2End, s3End, targetTotalDays];
  }

  const startDays: [number, number, number, number] = [
    0,
    endDays[0] + 1,
    endDays[1] + 1,
    endDays[2] + 1,
  ];

  const stages: StageDefinition[] = template.stages.map((st, idx) => ({
    stageNumber: st.stageNumber,
    name: st.name[language] ?? st.name.en,
    category: st.category,
    startDay: startDays[idx],
    endDay: endDays[idx],
    irrigationReminder: st.irrigation[language] ?? st.irrigation.en,
    fertilizerReminder: st.nutrition[language] ?? st.nutrition.en,
  }));

  return {
    crop: displayName,
    iconName,
    label: displayName,
    defaultTotalDays,
    totalDays: targetTotalDays,
    stages,
  };
}
