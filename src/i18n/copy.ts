export type Language = 'en' | 'kn' | 'hi';

export const languages: Record<Language, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
  hi: 'हिन्दी',
};

export type Copy = {
  tagline: string; greeting: string; intro: string; addActivity: string;
  activities: string; plots: string; season: string; recentActivities: string;
  viewAll: string; noActivities: string; startDiary: string; farmerTools: string;
  toolsComingSoon: string; diary: string; diarySubtitle: string; home: string;
  farm: string; records: string; more: string; myFarm: string;
  settingsSubtitle: string; language: string;
  privacyTitle: string; privacyText: string; activityTitle: string;
  activityPlaceholder: string; category: string; notes: string; notesPlaceholder: string;
  saveActivity: string; localNote: string; requiredTitle: string; enterActivity: string;
  deleteEntry: string; deleteConfirm: string; cancel: string; delete: string;

  // Shared form chrome
  save: string; today: string; invalidDate: string; requiredField: string;
  deleteConfirmGeneric: string; editActivity: string; noneOption: string;

  // Farm screen: Profile / Plots / Crops
  profileTab: string; plotsTab: string; cropsTab: string;
  farmName: string; farmNamePlaceholder: string;
  farmerName: string; farmerNamePlaceholder: string;
  village: string; villagePlaceholder: string;
  district: string; districtPlaceholder: string;
  stateField: string; statePlaceholder: string;
  totalArea: string; unit: string; profileIntro: string;

  addPlot: string; editPlot: string; plotName: string; plotNamePlaceholder: string;
  plotArea: string; noPlotsYet: string; addFirstPlot: string; deletePlot: string; noPlotLinked: string;

  addCrop: string; editCrop: string; cropName: string; cropNamePlaceholder: string;
  seasonField: string; linkToPlot: string; linkToCrop: string; sowingDate: string; expectedHarvestDate: string;
  noCropsYet: string; addFirstCrop: string; deleteCrop: string; noCropLinked: string;

  // Finance
  expenses: string; income: string; addExpense: string; addIncome: string;
  editExpense: string; editIncome: string; amount: string; amountPlaceholder: string;
  financeCategory: string; financeDate: string; invalidAmount: string;
  noExpensesYet: string; addFirstExpense: string; noIncomeYet: string; addFirstIncome: string;
  deleteExpense: string; deleteIncome: string;
  totalExpenses: string; totalIncome: string; netBalance: string; netBalanceNote: string;

  // Harvest
  harvests: string; addHarvest: string; editHarvest: string; harvestDate: string; quantity: string;
  sellingPrice: string; buyer: string; noHarvestsYet: string; addFirstHarvest: string; deleteHarvest: string;
  totalValue: string; valueNotRecorded: string;

  // Records
  recordsOverviewTab: string; financeTab: string; harvestsTab: string;
  totalActivities: string; seasonalHistory: string; noDataYet: string;

  // Backup & restore
  backupRestore: string; exportData: string; exportDescription: string;
  shareBackup: string; copyToClipboard: string; copied: string;
  restoreData: string; restoreDescription: string; pasteBackupPlaceholder: string;
  previewRestore: string; restoreWarningTitle: string; replaceDataWarning: string;
  recordsFoundInBackup: string; currentRecordsOnDevice: string;
  invalidBackupFile: string; restoreSuccess: string; confirmRestore: string;

  // Account / authentication
  account: string; accountIntro: string; signedInAs: string; signOut: string;
  signIn: string; createAccount: string; emailField: string; emailPlaceholder: string;
  passwordField: string; passwordPlaceholder: string; forgotPassword: string;
  resetPasswordSent: string; orDivider: string; continueWithGoogle: string;
  switchToSignIn: string; switchToSignUp: string; cloudSyncNotConfigured: string;
  authErrorInvalidEmail: string; authErrorEmailInUse: string; authErrorWeakPassword: string;
  authErrorWrongCredentials: string; authErrorTooManyRequests: string; authErrorNetwork: string;
  authErrorPopupClosed: string; authErrorGeneric: string; authErrorGoogleNeedsDevBuild: string;

  // Claiming pre-existing local data on first sign-in
  claimLocalDataTitle: string; claimLocalDataMessage: string;
  claimLocalDataConfirm: string; claimLocalDataSkip: string;

  // Sync status
  syncNow: string; syncing: string; syncSuccess: string; syncError: string;
  lastSynced: string; neverSynced: string; syncDescription: string;

  // Account deletion
  deleteAccount: string; deleteAccountIntro: string; deleteAccountWarning: string;
  deleteAccountExportFirst: string; deleteAccountExportButton: string;
  deleteAccountPasswordPrompt: string; deleteAccountConfirmField: string;
  deleteAccountConfirmButton: string; deleteAccountCancel: string;
  deleteAccountStepReauth: string; deleteAccountStepCloud: string;
  deleteAccountStepLocal: string; deleteAccountStepAuth: string;
  deleteAccountSuccess: string; deleteAccountPartialFailure: string;
  deleteAccountNeedsPassword: string; deleteAccountGoogleNativeUnsupported: string; deleteAccountDone: string;
  deleteAccountExported: string; deleteAccountStepWaitingSync: string; deleteAccountSyncBusy: string;
  deleteAccountStepLock: string;

  // Workspaces
  workspaces: string; workspacesSubtitle: string; addWorkspace: string; editWorkspace: string;
  workspaceName: string; workspaceNamePlaceholder: string; defaultWorkspaceName: string;
  exportSeasonReport: string;

  // Crop Growth Stage Calendar & Custom Crop
  cropStageCalendarTitle: string;
  cropStageCalendarSubtitle: string;
  cropInputLabel: string;
  cropInputPlaceholder: string;
  sowingDateLabel: string;
  quickPick: string;
  trackedInWorkspace: string;
  newCropPlan: string;
  growthSchedule: string;
  activeNow: string;
  stageCompleted: string;
  stageUpcoming: string;
  irrigation: string;
  fertilizerNutrition: string;
  trackingActive: string;
  deleteSchedule: string;
  deleteScheduleTitle: string;
  deleteScheduleConfirm: string;
  saveScheduleToWorkspace: string;
  savingSchedule: string;
  daysGrowth: string;
  cropMatured: string;
  sowingInDays: string;
  stageLabel: string;
  stageGermination: string;
  stageVegetative: string;
  stageFlowering: string;
  stageHarvest: string;
  voiceInputStart: string;
  voiceInputStop: string;

  // Farmer Account, Cloud Sync & Notifications
  farmerAccount: string;
  createFarmerAccount: string;
  villageOrFarm: string;
  villageOrFarmPlaceholder: string;
  farmerNamePlaceholderInput: string;
  offlineNotice: string;
  farmerAccountSubtitle: string;
  syncingWithCloud: string;
  syncedJustNow: string;
  syncFailed: string;
  syncStatusActive: string;
  syncStatusFailed: string;
  verificationEmailSent: string;
  emailNotVerified: string;
  emailVerified: string;
  resendVerificationEmail: string;
  notificationsTitle: string;
  notificationsSubtitle: string;
  dailyReminder: string;
  dailyReminderSubtitle: string;
  dailyReminderNotifTitle: string;
  dailyReminderNotifBody: string;
  notificationPermissionDenied: string;
  cropMilestonesActive: string;

  // Crop Growth Calendar additions
  daysCultivatedLabel: string;
  daysCultivatedPlaceholder: string;
  totalCropDaysLabel: string;
  totalCropDaysPlaceholder: string;
  defaultDurationHint: string;
  monthsApprox: string;
  popularCropsLabel: string;
  bsjdkSystemLabel: string;
  dayWord: string;
  dayShort: string;
  daysRangeLabel: string;
  daysUnit: string;
  customCropDefault: string;

  // Farmer Tools & Weather & Receipt Vault (EN/KN/HI)
  interactiveHub: string;
  toolWeather: string;
  toolLandUnit: string;
  toolProfitPlanner: string;
  weatherHumidity: string;
  weatherWind: string;
  weatherRainChance: string;
  weatherHighLow: string;
  weatherKmhUnit: string;
  weatherActivePlots: string;
  weatherSprayAdvisoryTitle: string;
  weatherIrrigationAdvisoryTitle: string;
  weatherUpdating: string;
  weatherRefresh: string;
  weatherUseGps: string;
  weatherSearchPlaceholder: string;
  weatherSearchBtn: string;
  weatherLastUpdated: string;
  weatherOfflineCached: string;
  weatherNoData: string;
  weatherGpsFallbackNotice: string;
  weatherLocationNotFound: string;
  weatherClear: string;
  weatherMainlyClear: string;
  weatherPartlyCloudy: string;
  weatherOvercast: string;
  weatherFoggy: string;
  weatherDrizzle: string;
  weatherRain: string;
  weatherHeavyRain: string;
  weatherShowers: string;
  weatherThunderstorm: string;
  weatherSprayAvoidRain: string;
  weatherSprayAvoidWind: string;
  weatherSprayHotDry: string;
  weatherSprayHighHumidity: string;
  weatherSprayOptimal: string;
  weatherIrrigRainExpected: string;
  weatherIrrigWindy: string;
  weatherIrrigHotDry: string;
  weatherIrrigHighHumidity: string;
  weatherIrrigOptimal: string;
  landConverterDesc: string;
  enterArea: string;
  selectUnit: string;
  profitPlannerDesc: string;
  expectedYieldKg: string;
  pricePerKg: string;
  estimatedExpensesLabel: string;
  projectedRevenue: string;
  estimatedExpensesSummary: string;
  netProjectedProfit: string;
  netProjectedLoss: string;
  profitMargin: string;
  vaultTitle: string;
  vaultSubtitle: string;
  vaultTakePhoto: string;
  vaultUploadGallery: string;
  vaultFilterAll: string;
  vaultCatFertilizerBill: string;
  vaultCatMandiSlip: string;
  vaultCatSoilReport: string;
  vaultCatOther: string;
  vaultEmptyTitle: string;
  vaultEmptyAll: string;
  vaultEmptyCategory: string;
  vaultSaveModalTitle: string;
  vaultDocTitleLabel: string;
  vaultDocTitlePlaceholder: string;
  vaultCategoryLabel: string;
  vaultSaveBtn: string;
  vaultSavingBtn: string;
  vaultPermRequiredTitle: string;
  vaultCameraPermMsg: string;
  vaultGalleryPermMsg: string;
  vaultCameraErrorTitle: string;
  vaultCameraErrorMsg: string;
  vaultGalleryErrorTitle: string;
  vaultGalleryErrorMsg: string;
  vaultTitleRequiredTitle: string;
  vaultTitleRequiredMsg: string;
  vaultSaveErrorTitle: string;
  vaultSaveErrorMsg: string;
  vaultDeleteTitle: string;
  vaultDeleteConfirm: string;

  // Export & Share Reports (PDF & Excel/CSV)
  exportShareReportTitle: string;
  exportShareReportSubtitle: string;
  exportReportButton: string;
  exportPdfReport: string;
  exportPdfReportDesc: string;
  exportCsvReport: string;
  exportCsvReportDesc: string;
  exportGeneratingPdf: string;
  exportGeneratingCsv: string;
  exportSuccessPdf: string;
  exportSuccessCsv: string;
  exportErrorGeneric: string;
  exportSharingUnavailable: string;
  sharePdfDialogTitle: string;
  shareCsvDialogTitle: string;
  reportSummaryHeading: string;
  reportFinanceHeading: string;
  reportHarvestsHeading: string;
  reportActivitiesHeading: string;
  reportCropSchedulesHeading: string;
  reportGeneratedOn: string;
  reportNoRecords: string;
  reportWorkspaceLabel: string;
};

export const copy: Record<Language, Copy> = {
  en: {
    tagline: "Every Farm's Story, All in One Diary",
    greeting: 'Your farm, your story.',
    intro: 'Keep your daily farm activities, expenses and season records together.',
    addActivity: 'Add Activity', activities: 'Activities', plots: 'Plots', season: 'Current season',
    recentActivities: 'Recent activities', viewAll: 'View all', noActivities: 'No activities yet',
    startDiary: 'Add your first farm activity to start your diary.', farmerTools: 'Farmer tools',
    toolsComingSoon: 'Weather advice, land conversion and farm profit planning will be connected in a later phase.',
    diary: 'Farm Diary', diarySubtitle: 'A simple record of the work happening on your farm.',
    home: 'Home', farm: 'Farm', records: 'Records', more: 'More', myFarm: 'My Farm',
    settingsSubtitle: 'Language and app preferences', language: 'App language',
    privacyTitle: 'Your data, your control', privacyText: 'Diary entries are always stored on this device first and work fully offline. Signing in is optional and only backs up your records to your own account.',
    activityTitle: 'Activity name', activityPlaceholder: 'e.g. Watered soybean plot',
    category: 'Activity type', notes: 'Notes (optional)', notesPlaceholder: 'Quantity, cost or other details…',
    saveActivity: 'Save activity', localNote: 'Saved on this device, and backed up to your account if you are signed in.',
    requiredTitle: 'Activity required', enterActivity: 'Enter an activity name to continue.',
    deleteEntry: 'Delete activity?', deleteConfirm: 'This activity will be removed from this device.',
    cancel: 'Cancel', delete: 'Delete',

    save: 'Save', today: 'Today', invalidDate: 'Enter a valid date as YYYY-MM-DD.',
    requiredField: 'This field is required.',
    deleteConfirmGeneric: 'This record will be removed from this device.',
    editActivity: 'Edit Activity', noneOption: 'None',

    profileTab: 'Profile', plotsTab: 'Plots', cropsTab: 'Crops',
    farmName: 'Farm name', farmNamePlaceholder: 'e.g. Green Valley Farm',
    farmerName: 'Farmer name', farmerNamePlaceholder: 'e.g. Ramesh Kumar',
    village: 'Village', villagePlaceholder: 'e.g. Hosahalli',
    district: 'District', districtPlaceholder: 'e.g. Mysuru',
    stateField: 'State', statePlaceholder: 'e.g. Karnataka',
    totalArea: 'Total land area', unit: 'Unit',
    profileIntro: 'This information stays on this device and helps personalize your diary.',

    addPlot: 'Add Plot', editPlot: 'Edit Plot', plotName: 'Plot name', plotNamePlaceholder: 'e.g. North field',
    plotArea: 'Area', noPlotsYet: 'No plots yet', addFirstPlot: 'Add your first plot to start mapping your farm.',
    deletePlot: 'Delete plot?', noPlotLinked: 'No plot linked',

    addCrop: 'Add Crop', editCrop: 'Edit Crop', cropName: 'Crop name', cropNamePlaceholder: 'e.g. Soybean',
    seasonField: 'Season', linkToPlot: 'Plot (optional)', linkToCrop: 'Crop (optional)',
    sowingDate: 'Sowing date', expectedHarvestDate: 'Expected harvest date (optional)',
    noCropsYet: 'No crops yet', addFirstCrop: 'Add your first crop to start tracking a season.',
    deleteCrop: 'Delete crop?', noCropLinked: 'No crop linked',

    expenses: 'Expenses', income: 'Income', addExpense: 'Add Expense', addIncome: 'Add Income',
    editExpense: 'Edit Expense', editIncome: 'Edit Income', amount: 'Amount (₹)', amountPlaceholder: 'e.g. 1500',
    financeCategory: 'Category', financeDate: 'Date', invalidAmount: 'Enter a valid amount greater than zero.',
    noExpensesYet: 'No expenses yet', addFirstExpense: 'Add your first expense to track farm spending.',
    noIncomeYet: 'No income yet', addFirstIncome: 'Add your first income to track farm earnings.',
    deleteExpense: 'Delete expense?', deleteIncome: 'Delete income?',
    totalExpenses: 'Total expenses', totalIncome: 'Total income', netBalance: 'Net balance',
    netBalanceNote: 'Calculated from recorded expenses and income only.',

    harvests: 'Harvests', addHarvest: 'Add Harvest', editHarvest: 'Edit Harvest', harvestDate: 'Harvest date',
    quantity: 'Quantity', sellingPrice: 'Selling price per unit (optional)', buyer: 'Buyer (optional)',
    noHarvestsYet: 'No harvests yet', addFirstHarvest: 'Add your first harvest record after a crop is gathered.',
    deleteHarvest: 'Delete harvest?', totalValue: 'Total value', valueNotRecorded: 'Not recorded',

    recordsOverviewTab: 'Overview', financeTab: 'Expenses & Income', harvestsTab: 'Harvests',
    totalActivities: 'Total activities', seasonalHistory: 'Seasonal history', noDataYet: 'No data yet',

    backupRestore: 'Export Reports & Restore',
    exportData: 'Export & Share Report',
    exportDescription: 'Generate and share a formatted PDF report or Excel (.csv) spreadsheet of your farm summary, activities, expenses, harvests, and crop schedules.',
    shareBackup: 'Export & Share Report (PDF / Excel)', copyToClipboard: 'Copy to clipboard', copied: 'Copied to clipboard.',
    restoreData: 'Restore from backup',
    restoreDescription: 'Paste a previously exported backup below to preview it before restoring.',
    pasteBackupPlaceholder: 'Paste backup text here…',
    previewRestore: 'Preview restore',
    restoreWarningTitle: 'Replace all data?',
    replaceDataWarning: 'This will permanently replace all existing data on this device with the contents of this backup. This cannot be undone.',
    recordsFoundInBackup: 'Records found in backup', currentRecordsOnDevice: 'Current records on this device',
    invalidBackupFile: "This doesn't look like a valid BhoomiShakti backup.", restoreSuccess: 'Data restored successfully.',
    confirmRestore: 'Replace and restore',

    account: 'Account', accountIntro: 'Sign in to back up your farm data to the cloud and use it on another device. The app keeps working offline either way.',
    signedInAs: 'Signed in as', signOut: 'Sign out',
    signIn: 'Sign in', createAccount: 'Create account', emailField: 'Email', emailPlaceholder: 'you@example.com',
    passwordField: 'Password', passwordPlaceholder: 'At least 6 characters', forgotPassword: 'Forgot password?',
    resetPasswordSent: 'If an account exists for this email, a reset link has been sent.',
    orDivider: 'or', continueWithGoogle: 'Continue with Google',
    switchToSignIn: 'Already have an account? Sign in', switchToSignUp: "Don't have an account? Create one",
    cloudSyncNotConfigured: 'Cloud sync is not set up for this app yet.',
    authErrorInvalidEmail: 'Enter a valid email address.',
    authErrorEmailInUse: 'An account with this email already exists. Try signing in instead.',
    authErrorWeakPassword: 'Choose a password with at least 6 characters.',
    authErrorWrongCredentials: 'Incorrect email or password.',
    authErrorTooManyRequests: 'Too many attempts. Please wait a bit and try again.',
    authErrorNetwork: 'Network error. Check your connection and try again.',
    authErrorPopupClosed: 'Sign-in was cancelled.',
    authErrorGeneric: 'Something went wrong. Please try again.',
    authErrorGoogleNeedsDevBuild: 'Google sign-in on this device needs a development build of the app, not Expo Go. It works on the web version right now.',

    claimLocalDataTitle: 'Use your existing data?',
    claimLocalDataMessage: 'You have farm records saved on this device from before signing in. Add them to your account so they back up to the cloud?',
    claimLocalDataConfirm: 'Yes, use this data', claimLocalDataSkip: 'No, start fresh',

    syncNow: 'Sync now', syncing: 'Syncing…', syncSuccess: 'Up to date', syncError: 'Sync failed, will retry',
    lastSynced: 'Last synced', neverSynced: 'Never synced',
    syncDescription: 'Your farm records are backed up to your account and available if you sign in on another device.',
    deleteAccount: 'Delete Account',
    deleteAccountIntro: 'This permanently deletes your account, your cloud backup, and this device\'s copy of your farm data. It cannot be undone.',
    deleteAccountWarning: 'We recommend exporting a backup before you continue.',
    deleteAccountExportFirst: 'Export a backup first',
    deleteAccountExportButton: 'Export backup',
    deleteAccountPasswordPrompt: 'Enter your password to confirm.',
    deleteAccountConfirmField: 'Current password',
    deleteAccountConfirmButton: 'Permanently delete my account',
    deleteAccountCancel: 'Cancel',
    deleteAccountStepReauth: 'Confirming your identity…',
    deleteAccountStepCloud: 'Deleting your cloud data…',
    deleteAccountStepLocal: 'Removing data from this device…',
    deleteAccountStepAuth: 'Deleting your account…',
    deleteAccountSuccess: 'Your account and data have been deleted.',
    deleteAccountPartialFailure: 'Some steps did not complete. It is safe to try again — nothing already deleted will be duplicated or lost.',
    deleteAccountNeedsPassword: 'Enter your password to continue.',
    deleteAccountGoogleNativeUnsupported: 'Deleting a Google-signed-in account from this device isn\'t supported yet. Please use the web app to delete this account.',
    deleteAccountDone: 'Done',
    deleteAccountExported: 'Backup exported.',
    deleteAccountStepWaitingSync: 'Finishing a pending sync before continuing…',
    deleteAccountSyncBusy: 'A sync is taking longer than expected to finish. Please try again in a moment.',
    deleteAccountStepLock: 'Securing your account for deletion…',

    workspaces: 'Workspaces',
    workspacesSubtitle: 'Manage different farm plots as separate workspaces.',
    addWorkspace: 'Add Workspace',
    editWorkspace: 'Edit Workspace',
    workspaceName: 'Workspace name',
    workspaceNamePlaceholder: 'e.g. South farm / Organic plot',
    defaultWorkspaceName: 'Default',
    exportSeasonReport: 'Export Season Report (PDF)',

    cropStageCalendarTitle: 'Automated Crop Growth Calendar',
    cropStageCalendarSubtitle: 'Workspace-scoped stage milestones & agronomic reminders',
    cropInputLabel: 'Crop Name',
    cropInputPlaceholder: 'Type your crop name (e.g. Paddy, Wheat, Cotton, Maize…)',
    sowingDateLabel: 'Sowing Date (YYYY-MM-DD)',
    quickPick: 'Quick Pick:',
    trackedInWorkspace: 'Tracked In Workspace:',
    newCropPlan: '＋ New Crop',
    growthSchedule: 'Growth Schedule',
    activeNow: 'Active Now',
    stageCompleted: 'Completed',
    stageUpcoming: 'Upcoming',
    irrigation: 'Irrigation',
    fertilizerNutrition: 'Fertilizer & Nutrition',
    trackingActive: '✓ Tracking active in this workspace',
    deleteSchedule: 'Delete Schedule',
    deleteScheduleTitle: 'Delete Schedule',
    deleteScheduleConfirm: 'Delete the growth stage calendar for {name}?',
    saveScheduleToWorkspace: 'Save Schedule to Workspace',
    savingSchedule: 'Saving…',
    daysGrowth: 'Total Growth Days',
    cropMatured: 'Crop Matured',
    sowingInDays: 'Sowing in',
    stageLabel: 'Stage',
    stageGermination: 'Germination',
    stageVegetative: 'Vegetative',
    stageFlowering: 'Flowering/Fruiting',
    stageHarvest: 'Harvest',
    voiceInputStart: 'Start voice input',
    voiceInputStop: 'Stop voice input',
    farmerAccount: 'Farmer Account & Cloud Sync',
    createFarmerAccount: 'Create Farmer Account',
    villageOrFarm: 'Village / Farm Name',
    villageOrFarmPlaceholder: 'e.g. Rampur Farm, Mandya',
    farmerNamePlaceholderInput: 'e.g. Ramesh Patil',
    offlineNotice: 'Your diary works 100% offline. Data is saved safely in your phone’s local SQLite database and automatically syncs to the cloud when signed in.',
    farmerAccountSubtitle: 'Back up your diary records, crop schedules, and farm data securely to the cloud.',
    syncingWithCloud: 'Syncing your farm records to cloud…',
    syncedJustNow: 'Synced just now',
    syncFailed: 'Cloud sync could not complete. Your local SQLite records are safe.',
    syncStatusActive: 'Active',
    syncStatusFailed: 'Failed',
    verificationEmailSent: 'Verification email sent! Check your inbox to verify your account.',
    emailNotVerified: 'Email not yet verified',
    emailVerified: 'Verified',
    resendVerificationEmail: 'Resend verification email',
    notificationsTitle: 'Farm Reminders & Notifications',
    notificationsSubtitle: 'Automated morning alerts for crop stages and daily evening diary reminders.',
    dailyReminder: 'Daily 7:00 PM Farm Diary Reminder',
    dailyReminderSubtitle: 'Gentle reminder every evening at 7:00 PM to record your day’s activities, expenses, and harvests.',
    dailyReminderNotifTitle: 'Daily Farm Diary Reminder',
    dailyReminderNotifBody: 'Take a moment to record today’s farm activities, expenses, and harvests before resting.',
    notificationPermissionDenied: 'Notification permission was not granted. Please enable notifications in your phone settings.',
    cropMilestonesActive: 'Crop stage morning alerts scheduled at 7:00 AM on milestone dates.',

    daysCultivatedLabel: 'Days Already Cultivated',
    daysCultivatedPlaceholder: 'e.g. 45',
    totalCropDaysLabel: 'Total Crop Growth Days',
    totalCropDaysPlaceholder: 'e.g. 150 (5+ months)',
    defaultDurationHint: 'Default: {days} days',
    monthsApprox: '~{months} mo',
    popularCropsLabel: 'Popular Crops:',
    bsjdkSystemLabel: 'BSJDK Nutrition & Care',
    dayWord: 'Day',
    dayShort: 'd',
    daysRangeLabel: 'Days',
    daysUnit: 'days',
    customCropDefault: 'Custom Crop',

    interactiveHub: 'Interactive Hub',
    toolWeather: 'Weather',
    toolLandUnit: 'Land Unit',
    toolProfitPlanner: 'Profit Planner',
    weatherHumidity: 'Humidity',
    weatherWind: 'Wind',
    weatherRainChance: 'Rain Chance',
    weatherHighLow: 'H {high}° / L {low}°',
    weatherKmhUnit: 'km/h',
    weatherActivePlots: 'Active Plots',
    weatherSprayAdvisoryTitle: 'Spray & Field Advisory',
    weatherIrrigationAdvisoryTitle: 'Irrigation Advisory',
    weatherUpdating: 'Updating live weather…',
    weatherRefresh: 'Refresh',
    weatherUseGps: 'Use GPS',
    weatherSearchPlaceholder: 'Village / District (e.g. Mandya)',
    weatherSearchBtn: 'Check',
    weatherLastUpdated: 'Last updated',
    weatherOfflineCached: 'Offline — showing saved weather',
    weatherNoData: 'Connect to the internet or enter your village/district to fetch live weather.',
    weatherGpsFallbackNotice: 'Location permission denied — showing weather for your farm area.',
    weatherLocationNotFound: 'Could not find weather for that area. Try district name.',
    weatherClear: 'Clear Sky',
    weatherMainlyClear: 'Mainly Clear',
    weatherPartlyCloudy: 'Partly Cloudy',
    weatherOvercast: 'Overcast',
    weatherFoggy: 'Fog / Mist',
    weatherDrizzle: 'Light Drizzle',
    weatherRain: 'Rain',
    weatherHeavyRain: 'Heavy Rain',
    weatherShowers: 'Rain Showers',
    weatherThunderstorm: 'Thunderstorm',
    weatherSprayAvoidRain: 'Avoid spraying BSJDK foliar sprays, bio-inputs, or crop protectants today due to rain or high rain probability.',
    weatherSprayAvoidWind: 'Winds are brisk (≥18 km/h) — avoid foliar spraying to prevent spray drift. Wait for calm early morning or evening hours.',
    weatherSprayHotDry: 'Hot and dry conditions — avoid midday spraying to prevent leaf scorch and evaporation. Spray early morning before 9 AM.',
    weatherSprayHighHumidity: 'High humidity (≥85%) — inspect dense crop canopies for fungal leaf spots and ensure good airflow.',
    weatherSprayOptimal: 'Calm wind and favorable conditions — good window for BSJDK JeevaDhara foliar sprays and weeding.',
    weatherIrrigRainExpected: 'Rain is expected or ongoing — pause scheduled irrigation and ensure field drainage channels are clear.',
    weatherIrrigWindy: 'Moderately windy — irrigate via drip or furrow in early morning to reduce evaporation loss.',
    weatherIrrigHotDry: 'High heat & evaporation — provide light, timely evening or early-morning irrigation and retain soil mulch.',
    weatherIrrigHighHumidity: 'Moisture is elevated — reduce irrigation frequency and avoid waterlogging around roots.',
    weatherIrrigOptimal: 'Balanced weather — continue stage-wise irrigation and BSJDK soil moisture mulching as scheduled.',
    landConverterDesc: 'Convert land measurements dynamically across regional and standard units.',
    enterArea: 'Enter Area',
    selectUnit: 'Select Unit',
    profitPlannerDesc: 'Calculate projected revenue, expenses, and net profit for your harvest.',
    expectedYieldKg: 'Expected Yield (Kg)',
    pricePerKg: 'Price per Kg (₹)',
    estimatedExpensesLabel: 'Estimated Expenses (₹)',
    projectedRevenue: 'Projected Revenue',
    estimatedExpensesSummary: 'Estimated Expenses',
    netProjectedProfit: 'Net Projected Profit',
    netProjectedLoss: 'Net Projected Loss',
    profitMargin: 'Margin',
    vaultTitle: 'Receipt & Soil Report Vault',
    vaultSubtitle: 'Workspace-scoped storage for bills, mandi slips & test reports',
    vaultTakePhoto: 'Take Photo',
    vaultUploadGallery: 'Upload from Gallery',
    vaultFilterAll: 'All',
    vaultCatFertilizerBill: 'Fertilizer Bill',
    vaultCatMandiSlip: 'Mandi Slip',
    vaultCatSoilReport: 'Soil Report',
    vaultCatOther: 'Other',
    vaultEmptyTitle: 'No documents saved',
    vaultEmptyAll: 'Capture an input bill or soil report photo to securely archive it in this workspace.',
    vaultEmptyCategory: 'No documents under "{category}".',
    vaultSaveModalTitle: 'Save Document to Vault',
    vaultDocTitleLabel: 'Document Title *',
    vaultDocTitlePlaceholder: 'e.g. BSJDK / Input Bill - May 2026',
    vaultCategoryLabel: 'Category *',
    vaultSaveBtn: 'Save to Vault',
    vaultSavingBtn: 'Saving…',
    vaultPermRequiredTitle: 'Permission Required',
    vaultCameraPermMsg: 'Camera access is required to capture photos of bills and soil reports.',
    vaultGalleryPermMsg: 'Gallery access is required to select photos of bills and soil reports.',
    vaultCameraErrorTitle: 'Camera Error',
    vaultCameraErrorMsg: 'Could not open camera. Please try again.',
    vaultGalleryErrorTitle: 'Gallery Error',
    vaultGalleryErrorMsg: 'Could not open gallery. Please try again.',
    vaultTitleRequiredTitle: 'Title Required',
    vaultTitleRequiredMsg: 'Please enter a title or description for this document.',
    vaultSaveErrorTitle: 'Save Error',
    vaultSaveErrorMsg: 'Could not save the document to the vault. Please try again.',
    vaultDeleteTitle: 'Delete Document',
    vaultDeleteConfirm: 'Delete "{title}"? This will permanently remove the image and record.',

    exportShareReportTitle: 'Export & Share Farm Report',
    exportShareReportSubtitle: 'Share clean daily or season farm reports via WhatsApp, Email, or Google Drive.',
    exportReportButton: 'Export Report',
    exportPdfReport: 'Export PDF Report',
    exportPdfReportDesc: 'Formatted summary with income, expenses, daily activities, harvests & crop stages.',
    exportCsvReport: 'Export Excel (.csv) Sheet',
    exportCsvReportDesc: 'Spreadsheet compatible with Microsoft Excel and Google Sheets.',
    exportGeneratingPdf: 'Generating PDF report…',
    exportGeneratingCsv: 'Generating Excel (.csv) sheet…',
    exportSuccessPdf: 'PDF report ready to share.',
    exportSuccessCsv: 'Excel (.csv) sheet ready to share.',
    exportErrorGeneric: 'Could not export report. Please try again.',
    exportSharingUnavailable: 'File sharing is not supported on this device.',
    sharePdfDialogTitle: 'Share BS Diary (BhoomiShakti) PDF Report',
    shareCsvDialogTitle: 'Share BS Diary (BhoomiShakti) Excel (.csv) Sheet',
    reportSummaryHeading: 'Farm Overview & Financial Summary',
    reportFinanceHeading: 'Income & Expenses',
    reportHarvestsHeading: 'Harvest Records',
    reportActivitiesHeading: 'Daily Farm Activities',
    reportCropSchedulesHeading: 'Automated Crop Growth Schedules',
    reportGeneratedOn: 'Generated on',
    reportNoRecords: 'No records recorded yet.',
    reportWorkspaceLabel: 'Workspace',
  },
  kn: {
    tagline: 'ಪ್ರತಿ ಹೊಲದ ಕಥೆ, ಒಂದೇ ಡೈರಿಯಲ್ಲಿ',
    greeting: 'ನಿಮ್ಮ ಹೊಲ, ನಿಮ್ಮ ಕಥೆ.',
    intro: 'ನಿಮ್ಮ ದೈನಂದಿನ ಕೃಷಿ ಕೆಲಸಗಳು, ಖರ್ಚುಗಳು ಮತ್ತು ಋತುವಿನ ದಾಖಲೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಇಡಿ.',
    addActivity: 'ಚಟುವಟಿಕೆ ಸೇರಿಸಿ', activities: 'ಚಟುವಟಿಕೆಗಳು', plots: 'ಹೊಲದ ಭಾಗಗಳು', season: 'ಪ್ರಸ್ತುತ ಋತು',
    recentActivities: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು', viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', noActivities: 'ಇನ್ನೂ ಚಟುವಟಿಕೆಗಳಿಲ್ಲ',
    startDiary: 'ನಿಮ್ಮ ಡೈರಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಮೊದಲ ಕೃಷಿ ಚಟುವಟಿಕೆಯನ್ನು ಸೇರಿಸಿ.', farmerTools: 'ರೈತರ ಸಾಧನಗಳು',
    toolsComingSoon: 'ಹವಾಮಾನ ಸಲಹೆ, ಭೂಮಿ ಅಳತೆ ಪರಿವರ್ತನೆ ಮತ್ತು ಲಾಭ ಯೋಜನೆ ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಸೇರಿಸಲಾಗುತ್ತದೆ.',
    diary: 'ಕೃಷಿ ಡೈರಿ', diarySubtitle: 'ನಿಮ್ಮ ಹೊಲದಲ್ಲಿ ನಡೆಯುವ ಕೆಲಸಗಳ ಸರಳ ದಾಖಲೆ.',
    home: 'ಮುಖಪುಟ', farm: 'ಹೊಲ', records: 'ದಾಖಲೆಗಳು', more: 'ಇನ್ನಷ್ಟು', myFarm: 'ನನ್ನ ಹೊಲ',
    settingsSubtitle: 'ಭಾಷೆ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು', language: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ',
    privacyTitle: 'ನಿಮ್ಮ ಡೇಟಾ, ನಿಮ್ಮ ನಿಯಂತ್ರಣ', privacyText: 'ಡೈರಿ ನಮೂದುಗಳು ಯಾವಾಗಲೂ ಮೊದಲು ಈ ಸಾಧನದಲ್ಲಿ ಸಂಗ್ರಹವಾಗುತ್ತವೆ ಮತ್ತು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಂಪೂರ್ಣವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ. ಸೈನ್ ಇನ್ ಮಾಡುವುದು ಐಚ್ಛಿಕವಾಗಿದ್ದು, ಇದು ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ನಿಮ್ಮ ಸ್ವಂತ ಖಾತೆಗೆ ಮಾತ್ರ ಬ್ಯಾಕಪ್ ಮಾಡುತ್ತದೆ.',
    activityTitle: 'ಚಟುವಟಿಕೆಯ ಹೆಸರು', activityPlaceholder: 'ಉದಾ. ಸೋಯಾಬೀನ್ ಹೊಲಕ್ಕೆ ನೀರು ಹಾಕಿದೆ',
    category: 'ಚಟುವಟಿಕೆಯ ಪ್ರಕಾರ', notes: 'ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)', notesPlaceholder: 'ಪ್ರಮಾಣ, ಖರ್ಚು ಅಥವಾ ಇತರ ವಿವರಗಳು…',
    saveActivity: 'ಚಟುವಟಿಕೆ ಉಳಿಸಿ', localNote: 'ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ, ಮತ್ತು ನೀವು ಸೈನ್ ಇನ್ ಆಗಿದ್ದರೆ ನಿಮ್ಮ ಖಾತೆಗೆ ಬ್ಯಾಕಪ್ ಆಗುತ್ತದೆ.',
    requiredTitle: 'ಚಟುವಟಿಕೆ ಅಗತ್ಯ', enterActivity: 'ಮುಂದುವರಿಯಲು ಚಟುವಟಿಕೆಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
    deleteEntry: 'ಚಟುವಟಿಕೆಯನ್ನು ಅಳಿಸಬೇಕೇ?', deleteConfirm: 'ಈ ಸಾಧನದಿಂದ ಚಟುವಟಿಕೆಯನ್ನು ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
    cancel: 'ರದ್ದುಮಾಡಿ', delete: 'ಅಳಿಸಿ',

    save: 'ಉಳಿಸಿ', today: 'ಇಂದು', invalidDate: 'ಸರಿಯಾದ ದಿನಾಂಕವನ್ನು YYYY-MM-DD ರೂಪದಲ್ಲಿ ನಮೂದಿಸಿ.',
    requiredField: 'ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯವಿದೆ.',
    deleteConfirmGeneric: 'ಈ ದಾಖಲೆಯನ್ನು ಈ ಸಾಧನದಿಂದ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
    editActivity: 'ಚಟುವಟಿಕೆ ಸಂಪಾದಿಸಿ', noneOption: 'ಯಾವುದೂ ಇಲ್ಲ',

    profileTab: 'ಪ್ರೊಫೈಲ್', plotsTab: 'ಹೊಲದ ಭಾಗಗಳು', cropsTab: 'ಬೆಳೆಗಳು',
    farmName: 'ಹೊಲದ ಹೆಸರು', farmNamePlaceholder: 'ಉದಾ. ಹಸಿರು ಕಣಿವೆ ಫಾರ್ಮ್',
    farmerName: 'ರೈತರ ಹೆಸರು', farmerNamePlaceholder: 'ಉದಾ. ರಮೇಶ್ ಕುಮಾರ್',
    village: 'ಗ್ರಾಮ', villagePlaceholder: 'ಉದಾ. ಹೊಸಹಳ್ಳಿ',
    district: 'ಜಿಲ್ಲೆ', districtPlaceholder: 'ಉದಾ. ಮೈಸೂರು',
    stateField: 'ರಾಜ್ಯ', statePlaceholder: 'ಉದಾ. ಕರ್ನಾಟಕ',
    totalArea: 'ಒಟ್ಟು ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣ', unit: 'ಅಳತೆ ಘಟಕ',
    profileIntro: 'ಈ ಮಾಹಿತಿ ಈ ಸಾಧನದಲ್ಲೇ ಉಳಿಯುತ್ತದೆ ಮತ್ತು ನಿಮ್ಮ ಡೈರಿಯನ್ನು ವೈಯಕ್ತಿಕಗೊಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',

    addPlot: 'ಹೊಲದ ಭಾಗ ಸೇರಿಸಿ', editPlot: 'ಹೊಲದ ಭಾಗ ಸಂಪಾದಿಸಿ', plotName: 'ಭಾಗದ ಹೆಸರು', plotNamePlaceholder: 'ಉದಾ. ಉತ್ತರ ಹೊಲ',
    plotArea: 'ವಿಸ್ತೀರ್ಣ', noPlotsYet: 'ಇನ್ನೂ ಹೊಲದ ಭಾಗಗಳಿಲ್ಲ', addFirstPlot: 'ನಿಮ್ಮ ಹೊಲವನ್ನು ಗುರುತಿಸಲು ಮೊದಲ ಭಾಗವನ್ನು ಸೇರಿಸಿ.',
    deletePlot: 'ಹೊಲದ ಭಾಗವನ್ನು ಅಳಿಸಬೇಕೇ?', noPlotLinked: 'ಯಾವುದೇ ಭಾಗ ಜೋಡಿಸಿಲ್ಲ',

    addCrop: 'ಬೆಳೆ ಸೇರಿಸಿ', editCrop: 'ಬೆಳೆ ಸಂಪಾದಿಸಿ', cropName: 'ಬೆಳೆಯ ಹೆಸರು', cropNamePlaceholder: 'ಉದಾ. ಸೋಯಾಬೀನ್',
    seasonField: 'ಋತು', linkToPlot: 'ಹೊಲದ ಭಾಗ (ಐಚ್ಛಿಕ)', linkToCrop: 'ಬೆಳೆ (ಐಚ್ಛಿಕ)',
    sowingDate: 'ಬಿತ್ತನೆ ದಿನಾಂಕ', expectedHarvestDate: 'ನಿರೀಕ್ಷಿತ ಕೊಯ್ಲು ದಿನಾಂಕ (ಐಚ್ಛಿಕ)',
    noCropsYet: 'ಇನ್ನೂ ಬೆಳೆಗಳಿಲ್ಲ', addFirstCrop: 'ಋತುವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲ ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ.',
    deleteCrop: 'ಬೆಳೆಯನ್ನು ಅಳಿಸಬೇಕೇ?', noCropLinked: 'ಯಾವುದೇ ಬೆಳೆ ಜೋಡಿಸಿಲ್ಲ',

    expenses: 'ಖರ್ಚುಗಳು', income: 'ಆದಾಯ', addExpense: 'ಖರ್ಚು ಸೇರಿಸಿ', addIncome: 'ಆದಾಯ ಸೇರಿಸಿ',
    editExpense: 'ಖರ್ಚು ಸಂಪಾದಿಸಿ', editIncome: 'ಆದಾಯ ಸಂಪಾದಿಸಿ', amount: 'ಮೊತ್ತ (₹)', amountPlaceholder: 'ಉದಾ. 1500',
    financeCategory: 'ವರ್ಗ', financeDate: 'ದಿನಾಂಕ', invalidAmount: 'ಸೊನ್ನೆಗಿಂತ ಹೆಚ್ಚಿನ ಸರಿಯಾದ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ.',
    noExpensesYet: 'ಇನ್ನೂ ಖರ್ಚುಗಳಿಲ್ಲ', addFirstExpense: 'ಹೊಲದ ಖರ್ಚನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲ ಖರ್ಚನ್ನು ಸೇರಿಸಿ.',
    noIncomeYet: 'ಇನ್ನೂ ಆದಾಯವಿಲ್ಲ', addFirstIncome: 'ಹೊಲದ ಆದಾಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲ ಆದಾಯವನ್ನು ಸೇರಿಸಿ.',
    deleteExpense: 'ಖರ್ಚನ್ನು ಅಳಿಸಬೇಕೇ?', deleteIncome: 'ಆದಾಯವನ್ನು ಅಳಿಸಬೇಕೇ?',
    totalExpenses: 'ಒಟ್ಟು ಖರ್ಚು', totalIncome: 'ಒಟ್ಟು ಆದಾಯ', netBalance: 'ನಿವ್ವಳ ಬ್ಯಾಲೆನ್ಸ್',
    netBalanceNote: 'ದಾಖಲಿಸಿದ ಖರ್ಚು ಮತ್ತು ಆದಾಯದಿಂದ ಮಾತ್ರ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.',

    harvests: 'ಕೊಯ್ಲುಗಳು', addHarvest: 'ಕೊಯ್ಲು ಸೇರಿಸಿ', editHarvest: 'ಕೊಯ್ಲು ಸಂಪಾದಿಸಿ', harvestDate: 'ಕೊಯ್ಲು ದಿನಾಂಕ',
    quantity: 'ಪ್ರಮಾಣ', sellingPrice: 'ಪ್ರತಿ ಘಟಕದ ಮಾರಾಟ ಬೆಲೆ (ಐಚ್ಛಿಕ)', buyer: 'ಖರೀದಿದಾರ (ಐಚ್ಛಿಕ)',
    noHarvestsYet: 'ಇನ್ನೂ ಕೊಯ್ಲುಗಳಿಲ್ಲ', addFirstHarvest: 'ಬೆಳೆ ಕೊಯ್ಲು ಮಾಡಿದ ನಂತರ ಮೊದಲ ದಾಖಲೆಯನ್ನು ಸೇರಿಸಿ.',
    deleteHarvest: 'ಕೊಯ್ಲನ್ನು ಅಳಿಸಬೇಕೇ?', totalValue: 'ಒಟ್ಟು ಮೌಲ್ಯ', valueNotRecorded: 'ದಾಖಲಾಗಿಲ್ಲ',

    recordsOverviewTab: 'ಸಾರಾಂಶ', financeTab: 'ಖರ್ಚು ಮತ್ತು ಆದಾಯ', harvestsTab: 'ಕೊಯ್ಲುಗಳು',
    totalActivities: 'ಒಟ್ಟು ಚಟುವಟಿಕೆಗಳು', seasonalHistory: 'ಋತುವಿನ ಇತಿಹಾಸ', noDataYet: 'ಇನ್ನೂ ಡೇಟಾ ಇಲ್ಲ',

    backupRestore: 'ವರದಿ ರಫ್ತು ಮತ್ತು ಮರುಸ್ಥಾಪನೆ',
    exportData: 'ವರದಿ ರಫ್ತು ಮಾಡಿ ಮತ್ತು ಹಂಚಿಕೊಳ್ಳಿ',
    exportDescription: 'ನಿಮ್ಮ ಹೊಲದ ಸಾರಾಂಶ, ಚಟುವಟಿಕೆಗಳು, ಖರ್ಚು-ಆದಾಯ, ಕೊಯ್ಲು ಮತ್ತು ಬೆಳೆ ವೇಳಾಪಟ್ಟಿಗಳ PDF ವರದಿ ಅಥವಾ Excel (.csv) ಶೀಟ್ ರಚಿಸಿ ಹಂಚಿಕೊಳ್ಳಿ.',
    shareBackup: 'ವರದಿ ರಫ್ತು ಮತ್ತು ಹಂಚಿಕೆ (PDF / Excel)', copyToClipboard: 'ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಿ', copied: 'ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ.',
    restoreData: 'ಬ್ಯಾಕಪ್‌ನಿಂದ ಮರುಸ್ಥಾಪಿಸಿ',
    restoreDescription: 'ಮರುಸ್ಥಾಪಿಸುವ ಮೊದಲು ಪೂರ್ವವೀಕ್ಷಿಸಲು ಹಿಂದೆ ರಫ್ತು ಮಾಡಿದ ಬ್ಯಾಕಪ್ ಅನ್ನು ಕೆಳಗೆ ಅಂಟಿಸಿ.',
    pasteBackupPlaceholder: 'ಬ್ಯಾಕಪ್ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ…',
    previewRestore: 'ಮರುಸ್ಥಾಪನೆ ಪೂರ್ವವೀಕ್ಷಿಸಿ',
    restoreWarningTitle: 'ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಬದಲಾಯಿಸಬೇಕೇ?',
    replaceDataWarning: 'ಇದು ಈ ಸಾಧನದಲ್ಲಿರುವ ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಈ ಬ್ಯಾಕಪ್‌ನ ವಿಷಯಗಳೊಂದಿಗೆ ಶಾಶ್ವತವಾಗಿ ಬದಲಾಯಿಸುತ್ತದೆ. ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.',
    recordsFoundInBackup: 'ಬ್ಯಾಕಪ್‌ನಲ್ಲಿ ಕಂಡುಬಂದ ದಾಖಲೆಗಳು', currentRecordsOnDevice: 'ಈ ಸಾಧನದಲ್ಲಿರುವ ಪ್ರಸ್ತುತ ದಾಖಲೆಗಳು',
    invalidBackupFile: 'ಇದು ಮಾನ್ಯ BhoomiShakti ಬ್ಯಾಕಪ್‌ನಂತೆ ಕಾಣುತ್ತಿಲ್ಲ.', restoreSuccess: 'ಡೇಟಾ ಯಶಸ್ವಿಯಾಗಿ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ.',
    confirmRestore: 'ಬದಲಾಯಿಸಿ ಮತ್ತು ಮರುಸ್ಥಾಪಿಸಿ',

    account: 'ಖಾತೆ', accountIntro: 'ನಿಮ್ಮ ಕೃಷಿ ಡೇಟಾವನ್ನು ಕ್ಲೌಡ್‌ಗೆ ಬ್ಯಾಕಪ್ ಮಾಡಲು ಮತ್ತು ಇನ್ನೊಂದು ಸಾಧನದಲ್ಲಿ ಬಳಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ. ಆ್ಯಪ್ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೂಡ ಕೆಲಸ ಮಾಡುತ್ತಲೇ ಇರುತ್ತದೆ.',
    signedInAs: 'ಸೈನ್ ಇನ್ ಆಗಿದ್ದೀರಿ', signOut: 'ಸೈನ್ ಔಟ್',
    signIn: 'ಸೈನ್ ಇನ್', createAccount: 'ಖಾತೆ ರಚಿಸಿ', emailField: 'ಇಮೇಲ್', emailPlaceholder: 'you@example.com',
    passwordField: 'ಪಾಸ್‌ವರ್ಡ್', passwordPlaceholder: 'ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು', forgotPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
    resetPasswordSent: 'ಈ ಇಮೇಲ್‌ಗೆ ಖಾತೆ ಇದ್ದರೆ, ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ.',
    orDivider: 'ಅಥವಾ', continueWithGoogle: 'Google ಮೂಲಕ ಮುಂದುವರಿಸಿ',
    switchToSignIn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ', switchToSignUp: 'ಖಾತೆ ಇಲ್ಲವೇ? ಒಂದನ್ನು ರಚಿಸಿ',
    cloudSyncNotConfigured: 'ಈ ಆ್ಯಪ್‌ಗೆ ಕ್ಲೌಡ್ ಸಿಂಕ್ ಇನ್ನೂ ಹೊಂದಿಸಲಾಗಿಲ್ಲ.',
    authErrorInvalidEmail: 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.',
    authErrorEmailInUse: 'ಈ ಇಮೇಲ್‌ನೊಂದಿಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ. ಬದಲಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    authErrorWeakPassword: 'ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳ ಪಾಸ್‌ವರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ.',
    authErrorWrongCredentials: 'ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್.',
    authErrorTooManyRequests: 'ಹಲವು ಪ್ರಯತ್ನಗಳಾಗಿವೆ. ಸ್ವಲ್ಪ ಸಮಯ ಕಾದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    authErrorNetwork: 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    authErrorPopupClosed: 'ಸೈನ್ ಇನ್ ರದ್ದಾಯಿತು.',
    authErrorGeneric: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    authErrorGoogleNeedsDevBuild: 'ಈ ಸಾಧನದಲ್ಲಿ Google ಸೈನ್ ಇನ್‌ಗೆ ಆ್ಯಪ್‌ನ ಡೆವಲಪ್‌ಮೆಂಟ್ ಬಿಲ್ಡ್ ಬೇಕು, Expo Go ಅಲ್ಲ. ಇದು ಈಗ ವೆಬ್ ಆವೃತ್ತಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',

    claimLocalDataTitle: 'ನಿಮ್ಮ ಈಗಿರುವ ಡೇಟಾವನ್ನು ಬಳಸಬೇಕೇ?',
    claimLocalDataMessage: 'ಸೈನ್ ಇನ್ ಮಾಡುವ ಮೊದಲು ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಿದ ಕೃಷಿ ದಾಖಲೆಗಳು ನಿಮ್ಮಲ್ಲಿವೆ. ಅವುಗಳನ್ನು ನಿಮ್ಮ ಖಾತೆಗೆ ಸೇರಿಸಿ ಕ್ಲೌಡ್‌ಗೆ ಬ್ಯಾಕಪ್ ಮಾಡಬೇಕೇ?',
    claimLocalDataConfirm: 'ಹೌದು, ಈ ಡೇಟಾ ಬಳಸಿ', claimLocalDataSkip: 'ಬೇಡ, ಹೊಸದಾಗಿ ಪ್ರಾರಂಭಿಸಿ',

    syncNow: 'ಈಗ ಸಿಂಕ್ ಮಾಡಿ', syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ…', syncSuccess: 'ನವೀಕೃತವಾಗಿದೆ', syncError: 'ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುತ್ತದೆ',
    lastSynced: 'ಕೊನೆಯ ಸಿಂಕ್', neverSynced: 'ಎಂದಿಗೂ ಸಿಂಕ್ ಆಗಿಲ್ಲ',
    syncDescription: 'ನಿಮ್ಮ ಕೃಷಿ ದಾಖಲೆಗಳು ನಿಮ್ಮ ಖಾತೆಗೆ ಬ್ಯಾಕಪ್ ಆಗಿವೆ ಮತ್ತು ಇನ್ನೊಂದು ಸಾಧನದಲ್ಲಿ ಸೈನ್ ಇನ್ ಮಾಡಿದಾಗ ಲಭ್ಯವಿರುತ್ತವೆ.',
    deleteAccount: 'ಖಾತೆ ಅಳಿಸಿ',
    deleteAccountIntro: 'ಇದು ನಿಮ್ಮ ಖಾತೆ, ನಿಮ್ಮ ಕ್ಲೌಡ್ ಬ್ಯಾಕಪ್ ಮತ್ತು ಈ ಸಾಧನದಲ್ಲಿರುವ ನಿಮ್ಮ ಕೃಷಿ ಡೇಟಾದ ಪ್ರತಿಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ. ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    deleteAccountWarning: 'ಮುಂದುವರಿಯುವ ಮೊದಲು ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.',
    deleteAccountExportFirst: 'ಮೊದಲು ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಿ',
    deleteAccountExportButton: 'ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಿ',
    deleteAccountPasswordPrompt: 'ದೃಢೀಕರಿಸಲು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.',
    deleteAccountConfirmField: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್',
    deleteAccountConfirmButton: 'ನನ್ನ ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ',
    deleteAccountCancel: 'ರದ್ದುಮಾಡಿ',
    deleteAccountStepReauth: 'ನಿಮ್ಮ ಗುರುತನ್ನು ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ…',
    deleteAccountStepCloud: 'ನಿಮ್ಮ ಕ್ಲೌಡ್ ಡೇಟಾವನ್ನು ಅಳಿಸಲಾಗುತ್ತಿದೆ…',
    deleteAccountStepLocal: 'ಈ ಸಾಧನದಿಂದ ಡೇಟಾವನ್ನು ತೆಗೆದುಹಾಕಲಾಗುತ್ತಿದೆ…',
    deleteAccountStepAuth: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಲಾಗುತ್ತಿದೆ…',
    deleteAccountSuccess: 'ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಡೇಟಾವನ್ನು ಅಳಿಸಲಾಗಿದೆ.',
    deleteAccountPartialFailure: 'ಕೆಲವು ಹಂತಗಳು ಪೂರ್ಣಗೊಂಡಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುವುದು ಸುರಕ್ಷಿತ — ಈಗಾಗಲೇ ಅಳಿಸಿದ್ದು ನಕಲಾಗುವುದಿಲ್ಲ ಅಥವಾ ಕಳೆದುಹೋಗುವುದಿಲ್ಲ.',
    deleteAccountNeedsPassword: 'ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.',
    deleteAccountGoogleNativeUnsupported: 'ಈ ಸಾಧನದಿಂದ Google ಖಾತೆಯನ್ನು ಅಳಿಸುವುದು ಇನ್ನೂ ಬೆಂಬಲಿತವಿಲ್ಲ. ದಯವಿಟ್ಟು ಈ ಖಾತೆಯನ್ನು ಅಳಿಸಲು ವೆಬ್ ಆ್ಯಪ್ ಬಳಸಿ.',
    deleteAccountDone: 'ಮುಗಿದಿದೆ',
    deleteAccountExported: 'ಬ್ಯಾಕಪ್ ರಫ್ತಾಗಿದೆ.',
    deleteAccountStepWaitingSync: 'ಮುಂದುವರಿಯುವ ಮೊದಲು ಬಾಕಿ ಇರುವ ಸಿಂಕ್ ಅನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗುತ್ತಿದೆ…',
    deleteAccountSyncBusy: 'ಸಿಂಕ್ ಪೂರ್ಣಗೊಳ್ಳಲು ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    deleteAccountStepLock: 'ಅಳಿಸುವಿಕೆಗಾಗಿ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಲಾಗುತ್ತಿದೆ…',

    workspaces: 'ಕಾರ್ಯಕ್ಷೇತ್ರಗಳು',
    workspacesSubtitle: 'ವಿವಿಧ ಕೃಷಿ ಪ್ಲಾಟ್‌ಗಳನ್ನು ಪ್ರತ್ಯೇಕ ಕಾರ್ಯಕ್ಷೇತ್ರಗಳಾಗಿ ನಿರ್ವಹಿಸಿ.',
    addWorkspace: 'ಕಾರ್ಯಕ್ಷೇತ್ರ ಸೇರಿಸಿ',
    editWorkspace: 'ಕಾರ್ಯಕ್ಷೇತ್ರ ಸಂಪಾದಿಸಿ',
    workspaceName: 'ಕಾರ್ಯಕ್ಷೇತ್ರದ ಹೆಸರು',
    workspaceNamePlaceholder: 'ಉದಾ. ದಕ್ಷಿಣ ಕೃಷಿ / ಸಾವಯವ ಪ್ಲಾಟ್',
    defaultWorkspaceName: 'ಡೀಫಾಲ್ಟ್',
    exportSeasonReport: 'ಋತುವಿನ ವರದಿ ರಫ್ತು ಮಾಡಿ (PDF)',

    cropStageCalendarTitle: 'ಸ್ವಯಂಚಾಲಿತ ಬೆಳೆ ಬೆಳವಣಿಗೆ ಕ್ಯಾಲೆಂಡರ್',
    cropStageCalendarSubtitle: 'ಕಾರ್ಯಕ್ಷೇತ್ರ-ಆಧಾರಿತ ಹಂತದ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಕೃಷಿ ಜ್ಞಾಪನೆಗಳು',
    cropInputLabel: 'ಬೆಳೆಯ ಹೆಸರು',
    cropInputPlaceholder: 'ನಿಮ್ಮ ಬೆಳೆಯ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಭತ್ತ, ಗೋಧಿ, ಹತ್ತಿ, ಜೋಳ…)',
    sowingDateLabel: 'ಬಿತ್ತನೆ ದಿನಾಂಕ (YYYY-MM-DD)',
    quickPick: 'ತ್ವರಿತ ಆಯ್ಕೆ:',
    trackedInWorkspace: 'ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ:',
    newCropPlan: '＋ ಹೊಸ ಬೆಳೆ',
    growthSchedule: 'ಬೆಳವಣಿಗೆ ವೇಳಾಪಟ್ಟಿ',
    activeNow: 'ಈಗ ಸಕ್ರಿಯ',
    stageCompleted: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    stageUpcoming: 'ಮುಂಬರುವ',
    irrigation: 'ನೀರಾವರಿ',
    fertilizerNutrition: 'ಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ',
    trackingActive: '✓ ಈ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಟ್ರ್ಯಾಕಿಂಗ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    deleteSchedule: 'ವೇಳಾಪಟ್ಟಿ ಅಳಿಸಿ',
    deleteScheduleTitle: 'ವೇಳಾಪಟ್ಟಿ ಅಳಿಸುವುದೇ?',
    deleteScheduleConfirm: '{name} ಗಾಗಿ ಬೆಳವಣಿಗೆಯ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಅಳಿಸುವುದೇ?',
    saveScheduleToWorkspace: 'ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ವೇಳಾಪಟ್ಟಿ ಉಳಿಸಿ',
    savingSchedule: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    daysGrowth: 'ಒಟ್ಟು ಬೆಳವಣಿಗೆಯ ದಿನಗಳು',
    cropMatured: 'ಬೆಳೆ ಪಕ್ವವಾಗಿದೆ',
    sowingInDays: 'ಇನ್ನೂ ಬಿತ್ತನೆಗೆ ಬಾಕಿ ದಿನಗಳು',
    stageLabel: 'ಹಂತ',
    stageGermination: 'ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ',
    stageVegetative: 'ಸಸ್ಯಕ ಬೆಳವಣಿಗೆ',
    stageFlowering: 'ಹೂಬಿಡುವಿಕೆ/ಕಾಯಿ',
    stageHarvest: 'ಕೊಯ್ಲು',
    voiceInputStart: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಪ್ರಾರಂಭಿಸಿ',
    voiceInputStop: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್ ನಿಲ್ಲಿಸಿ',
    farmerAccount: 'ರೈತರ ಖಾತೆ ಮತ್ತು ಕ್ಲೌಡ್ ಸಿಂಕ್',
    createFarmerAccount: 'ರೈತರ ಖಾತೆ ರಚಿಸಿ',
    villageOrFarm: 'ಗ್ರಾಮ / ಹೊಲದ ಹೆಸರು',
    villageOrFarmPlaceholder: 'ಉದಾ: ರಾಂಪುರ, ಮಂಡ್ಯ',
    farmerNamePlaceholderInput: 'ಉದಾ: ರಮೇಶ್ ಪಾಟೀಲ್',
    offlineNotice: 'ನಿಮ್ಮ ಡೈರಿ ಸಂಪೂರ್ಣವಾಗಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ. ಡೇಟಾ ನಿಮ್ಮ ಫೋನಿನ SQLite ನಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್ ಇದ್ದಾಗ ಕ್ಲೌಡ್‌ಗೆ ಸಿಂಕ್ ಆಗುತ್ತದೆ.',
    farmerAccountSubtitle: 'ನಿಮ್ಮ ಡೈರಿ ದಾಖಲೆಗಳು, ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಕೃಷಿ ವಿವರಗಳನ್ನು ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.',
    syncingWithCloud: 'ನಿಮ್ಮ ಕೃಷಿ ದಾಖಲೆಗಳನ್ನು ಕ್ಲೌಡ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ…',
    syncedJustNow: 'ಈಗಷ್ಟೇ ಸಿಂಕ್ ಆಗಿದೆ',
    syncFailed: 'ಕ್ಲೌಡ್ ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ. ನಿಮ್ಮ ಫೋನಿನ ಡೇಟಾ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
    syncStatusActive: 'ಸಕ್ರಿಯ',
    syncStatusFailed: 'ವಿಫಲವಾಗಿದೆ',
    verificationEmailSent: 'ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಖಾತೆಯನ್ನು ದೃಢೀಕರಿಸಲು ಇನ್‌ಬಾಕ್ಸ್ ಪರಿಶೀಲಿಸಿ.',
    emailNotVerified: 'ಇಮೇಲ್ ಇನ್ನೂ ದೃಢೀಕರಿಸಿಲ್ಲ',
    emailVerified: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    resendVerificationEmail: 'ದೃಢೀಕರಣ ಇಮೇಲ್ ಮತ್ತೆ ಕಳುಹಿಸಿ',
    notificationsTitle: 'ಕೃಷಿ ಜ್ಞಾಪನೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    notificationsSubtitle: 'ಬೆಳೆ ಬೆಳವಣಿಗೆ ಹಂತದ ಬೆಳಗಿನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಪ್ರತಿದಿನ ಸಂಜೆಯ ಡೈರಿ ಜ್ಞಾಪನೆಗಳು.',
    dailyReminder: 'ಪ್ರತಿದಿನ ಸಂಜೆ 7:00 ಗಂಟೆಯ ಡೈರಿ ಜ್ಞಾಪನೆ',
    dailyReminderSubtitle: 'ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳು, ಖರ್ಚು-ವೆಚ್ಚ ಮತ್ತು ಇಳುವರಿ ದಾಖಲಿಸಲು ಪ್ರತಿದಿನ ಸಂಜೆ 7:00 ಗಂಟೆಗೆ ಜ್ಞಾಪನೆ.',
    dailyReminderNotifTitle: 'ದೈನಂದಿನ ಕೃಷಿ ಡೈರಿ ಜ್ಞಾಪನೆ',
    dailyReminderNotifBody: 'ಇಂದಿನ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು, ಖರ್ಚು ಮತ್ತು ಕೊಯ್ಲನ್ನು ಡೈರಿಯಲ್ಲಿ ದಾಖಲಿಸಲು ಸ್ವಲ್ಪ ಸಮಯ ನೀಡಿ.',
    notificationPermissionDenied: 'ಅಧಿಸೂಚನೆ ಅನುಮತಿ ನೀಡಿಲ್ಲ. ದಯವಿಟ್ಟು ಫೋನ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಿ.',
    cropMilestonesActive: 'ಬೆಳೆ ಹಂತದ ಮೈಲಿಗಲ್ಲುಗಳಲ್ಲಿ ಬೆಳಿಗ್ಗೆ 7:00 ಗಂಟೆಗೆ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',

    daysCultivatedLabel: 'ಈಗಾಗಲೇ ಬೆಳೆದ ದಿನಗಳು',
    daysCultivatedPlaceholder: 'ಉದಾ. 45',
    totalCropDaysLabel: 'ಒಟ್ಟು ಬೆಳೆ ಬೆಳವಣಿಗೆಯ ದಿನಗಳು',
    totalCropDaysPlaceholder: 'ಉದಾ. 150 (5+ ತಿಂಗಳು)',
    defaultDurationHint: 'ಸಾಮಾನ್ಯ ಅವಧಿ: {days} ದಿನಗಳು',
    monthsApprox: '~{months} ತಿಂಗಳು',
    popularCropsLabel: 'ಪ್ರಮುಖ ಬೆಳೆಗಳು:',
    bsjdkSystemLabel: 'ಬಿಎಸ್‌ಜೆಡಿಕೆ ಪೋಷಣೆ ಮತ್ತು ಆರೈಕೆ',
    dayWord: 'ದಿನ',
    dayShort: 'ದಿನ',
    daysRangeLabel: 'ದಿನಗಳು',
    daysUnit: 'ದಿನಗಳು',
    customCropDefault: 'ಇತರೆ ಬೆಳೆ',

    interactiveHub: 'ರೈತ ಕೇಂದ್ರ',
    toolWeather: 'ಹವಾಮಾನ',
    toolLandUnit: 'ಭೂಮಿ ಅಳತೆ',
    toolProfitPlanner: 'ಲಾಭ ಯೋಜನೆ',
    weatherHumidity: 'ಆರ್ದ್ರತೆ',
    weatherWind: 'ಗಾಳಿ ವೇಗ',
    weatherRainChance: 'ಮಳೆ ಸಾಧ್ಯತೆ',
    weatherHighLow: 'ಗರಿಷ್ಠ {high}° / ಕನಿಷ್ಠ {low}°',
    weatherKmhUnit: 'ಕಿಮೀ/ಗಂ',
    weatherActivePlots: 'ಸಕ್ರಿಯ ಹೊಲಗಳು',
    weatherSprayAdvisoryTitle: 'ಸಿಂಪಡಣೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ',
    weatherIrrigationAdvisoryTitle: 'ನೀರಾವರಿ ಸಲಹೆ',
    weatherUpdating: 'ತಾಜಾ ಹವಾಮಾನ ಪಡೆಯಲಾಗುತ್ತಿದೆ…',
    weatherRefresh: 'ನವೀಕರಿಸಿ',
    weatherUseGps: 'ಜಿಪಿಎಸ್ ಬಳಸಿ',
    weatherSearchPlaceholder: 'ಗ್ರಾಮ / ಜಿಲ್ಲೆ (ಉದಾ. ಮಂಡ್ಯ)',
    weatherSearchBtn: 'ಹುಡುಕಿ',
    weatherLastUpdated: 'ಕೊನೆಯ ನವೀಕರಣ',
    weatherOfflineCached: 'ಆಫ್‌ಲೈನ್ — ಉಳಿಸಿದ ಹವಾಮಾನ',
    weatherNoData: 'ತಾಜಾ ಹವಾಮಾನ ಪಡೆಯಲು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಗ್ರಾಮ/ಜಿಲ್ಲೆಯನ್ನು ನಮೂದಿಸಿ.',
    weatherGpsFallbackNotice: 'ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿಲ್ಲ — ನಿಮ್ಮ ಹೊಲದ ಪ್ರದೇಶದ ಹವಾಮಾನ ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    weatherLocationNotFound: 'ಆ ಪ್ರದೇಶದ ಹವಾಮಾನ ಸಿಗಲಿಲ್ಲ. ಜಿಲ್ಲೆಯ ಹೆಸರನ್ನು ಪ್ರಯತ್ನಿಸಿ.',
    weatherClear: 'ಸ್ಪಷ್ಟ ಆಕಾಶ',
    weatherMainlyClear: 'ಬಹುತೇಕ ಸ್ಪಷ್ಟ',
    weatherPartlyCloudy: 'ಭಾಗಶಃ ಮೋಡ',
    weatherOvercast: 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ',
    weatherFoggy: 'ಮಂಜು / ಇಬ್ಬನಿ',
    weatherDrizzle: 'ತುಂತುರು ಮಳೆ',
    weatherRain: 'ಮಳೆ',
    weatherHeavyRain: 'ಭಾರಿ ಮಳೆ',
    weatherShowers: 'ಮಳೆ ಹನಿಗಳು',
    weatherThunderstorm: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
    weatherSprayAvoidRain: 'ಮಳೆ ಅಥವಾ ಮಳೆಯ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ ಇಂದು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಎಲೆ ಸಿಂಪಡಣೆ ಅಥವಾ ಜೈವಿಕ ದ್ರಾವಣ ಸಿಂಪಡಿಸಬೇಡಿ.',
    weatherSprayAvoidWind: 'ಗಾಳಿ ವೇಗ ಹೆಚ್ಚಾಗಿದೆ (≥18 ಕಿಮೀ/ಗಂ) — ಸಿಂಪಡಣೆ ಹರಡುವುದನ್ನು ತಡೆಯಲು ಈಗ ಸಿಂಪಡಿಸಬೇಡಿ. ಬೆಳಗಿನ ಜಾವ ಅಥವಾ ಸಂಜೆ ಕಾಯಿರಿ.',
    weatherSprayHotDry: 'ಬಿಸಿಲು ಮತ್ತು ಶುಷ್ಕ ಹವಾಮಾನವಿದೆ — ಎಲೆ ಸುಡುವುದನ್ನು ತಡೆಯಲು ಮಧ್ಯಾಹ್ನ ಸಿಂಪಡಿಸಬೇಡಿ. ಬೆಳಿಗ್ಗೆ 9 ಗಂಟೆಯ ಮೊದಲು ಸಿಂಪಡಿಸಿ.',
    weatherSprayHighHumidity: 'ಅಧಿಕ ಆರ್ದ್ರತೆ (≥85%) — ದಟ್ಟವಾದ ಬೆಳೆಗಳಲ್ಲಿ ಶಿಲೀಂಧ್ರ ರೋಗಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಗಾಳಿಯಾಡುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
    weatherSprayOptimal: 'ಶಾಂತ ಗಾಳಿ ಮತ್ತು ಅನುಕೂಲಕರ ಹವಾಮಾನ — ಬಿಎಸ್‌ಜೆಡಿಕೆ ಜೀವಧಾರಾ ಎಲೆ ಸಿಂಪಡಣೆ ಮತ್ತು ಕಳೆ ತೆಗೆಯಲು ಉತ್ತಮ ಸಮಯ.',
    weatherIrrigRainExpected: 'ಮಳೆ ಬರುವ ಸಾಧ್ಯತೆ ಇದೆ ಅಥವಾ ಬೀಳುತ್ತಿದೆ — ನಿಗದಿತ ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ ಮತ್ತು ಹೊಲದ ನೀರು ಬಸಿಯುವ ಕಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ.',
    weatherIrrigWindy: 'ಸಾಧಾರಣ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ — ಆವಿಯಾಗುವುದನ್ನು ತಡೆಯಲು ಬೆಳಗಿನ ಜಾವ ಹನಿ ಅಥವಾ ಸಾಲು ನೀರಾವರಿ ನೀಡಿ.',
    weatherIrrigHotDry: 'ಅಧಿಕ ಬಿಸಿಲು ಮತ್ತು ಆವಿಯಾಗುವಿಕೆ — ಸಂಜೆ ಅಥವಾ ಬೆಳಿಗ್ಗೆ ಲಘು ನೀರಾವರಿ ನೀಡಿ ಮತ್ತು ಮಣ್ಣಿನ ಹೊದಿಕೆ (ಮಲ್ಚಿಂಗ್) ಕಾಪಾಡಿ.',
    weatherIrrigHighHumidity: 'ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ — ನೀರಾವರಿ ಅಂತರವನ್ನು ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಬೇರುಗಳ ಬಳಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
    weatherIrrigOptimal: 'ಸಮತೋಲಿತ ಹವಾಮಾನ — ವೇಳಾಪಟ್ಟಿಯಂತೆ ಹಂತವಾರು ನೀರಾವರಿ ಮತ್ತು ಬಿಎಸ್‌ಜೆಡಿಕೆ ಮಣ್ಣಿನ ತೇವಾಂಶ ರಕ್ಷಣೆ ಮುಂದುವರಿಸಿ.',
    landConverterDesc: 'ಸ್ಥಳೀಯ ಮತ್ತು ಪ್ರಮಾಣಿತ ಘಟಕಗಳ ನಡುವೆ ಭೂಮಿ ಅಳತೆಯನ್ನು ತಕ್ಷಣ ಪರಿವರ್ತಿಸಿ.',
    enterArea: 'ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ',
    selectUnit: 'ಘಟಕ ಆಯ್ಕೆಮಾಡಿ',
    profitPlannerDesc: 'ನಿಮ್ಮ ಕೊಯ್ಲಿನ ನಿರೀಕ್ಷಿತ ಆದಾಯ, ಖರ್ಚು ಮತ್ತು ನಿವ್ವಳ ಲಾಭವನ್ನು ಲೆಕ್ಕಹಾಕಿ.',
    expectedYieldKg: 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ (ಕೆ.ಜಿ.)',
    pricePerKg: 'ಪ್ರತಿ ಕೆ.ಜಿ. ದರ (₹)',
    estimatedExpensesLabel: 'ಅಂದಾಜು ಖರ್ಚು (₹)',
    projectedRevenue: 'ನಿರೀಕ್ಷಿತ ಆದಾಯ',
    estimatedExpensesSummary: 'ಅಂದಾಜು ಖರ್ಚು',
    netProjectedProfit: 'ನಿರೀಕ್ಷಿತ ನಿವ್ವಳ ಲಾಭ',
    netProjectedLoss: 'ನಿರೀಕ್ಷಿತ ನಿವ್ವಳ ನಷ್ಟ',
    profitMargin: 'ಲಾಭದ ಪ್ರಮಾಣ',
    vaultTitle: 'ರಸೀದಿ ಮತ್ತು ಮಣ್ಣು ವರದಿ ವಾಲ್ಟ್',
    vaultSubtitle: 'ಬಿಲ್ಲುಗಳು, ಮಂಡಿ ಚೀಟಿಗಳು ಮತ್ತು ಪರೀಕ್ಷಾ ವರದಿಗಳ ಕಾರ್ಯಕ್ಷೇತ್ರ-ಆಧಾರಿತ ಸಂಗ್ರಹ',
    vaultTakePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    vaultUploadGallery: 'ಗ್ಯಾಲರಿಯಿಂದ ಅಪ್‌ಲೋಡ್',
    vaultFilterAll: 'ಎಲ್ಲಾ',
    vaultCatFertilizerBill: 'ಗೊಬ್ಬರ ಬಿಲ್',
    vaultCatMandiSlip: 'ಮಂಡಿ ಚೀಟಿ',
    vaultCatSoilReport: 'ಮಣ್ಣು ವರದಿ',
    vaultCatOther: 'ಇತರೆ',
    vaultEmptyTitle: 'ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ',
    vaultEmptyAll: 'ಈ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸಲು ಗೊಬ್ಬರ ಬಿಲ್ ಅಥವಾ ಮಣ್ಣು ವರದಿಯ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    vaultEmptyCategory: '"{category}" ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.',
    vaultSaveModalTitle: 'ವಾಲ್ಟ್‌ಗೆ ದಾಖಲೆ ಉಳಿಸಿ',
    vaultDocTitleLabel: 'ದಾಖಲೆಯ ಶೀರ್ಷಿಕೆ *',
    vaultDocTitlePlaceholder: 'ಉದಾ. ಬಿಎಸ್‌ಜೆಡಿಕೆ / ಕೃಷಿ ಬಿಲ್ - ಮೇ 2026',
    vaultCategoryLabel: 'ವರ್ಗ *',
    vaultSaveBtn: 'ವಾಲ್ಟ್‌ಗೆ ಉಳಿಸಿ',
    vaultSavingBtn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
    vaultPermRequiredTitle: 'ಅನುಮತಿ ಅಗತ್ಯವಿದೆ',
    vaultCameraPermMsg: 'ಬಿಲ್ಲುಗಳು ಮತ್ತು ಮಣ್ಣು ವರದಿಗಳ ಫೋಟೋ ತೆಗೆಯಲು ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.',
    vaultGalleryPermMsg: 'ಬಿಲ್ಲುಗಳು ಮತ್ತು ಮಣ್ಣು ವರದಿಗಳ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಲು ಗ್ಯಾಲರಿ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.',
    vaultCameraErrorTitle: 'ಕ್ಯಾಮೆರಾ ದೋಷ',
    vaultCameraErrorMsg: 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    vaultGalleryErrorTitle: 'ಗ್ಯಾಲರಿ ದೋಷ',
    vaultGalleryErrorMsg: 'ಗ್ಯಾಲರಿ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    vaultTitleRequiredTitle: 'ಶೀರ್ಷಿಕೆ ಅಗತ್ಯವಿದೆ',
    vaultTitleRequiredMsg: 'ದಯವಿಟ್ಟು ಈ ದಾಖಲೆಗೆ ಶೀರ್ಷಿಕೆ ಅಥವಾ ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ.',
    vaultSaveErrorTitle: 'ಉಳಿಸುವಲ್ಲಿ ದೋಷ',
    vaultSaveErrorMsg: 'ವಾಲ್ಟ್‌ಗೆ ದಾಖಲೆ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    vaultDeleteTitle: 'ದಾಖಲೆ ಅಳಿಸಿ',
    vaultDeleteConfirm: '"{title}" ಅನ್ನು ಅಳಿಸಬೇಕೇ? ಇದು ಚಿತ್ರ ಮತ್ತು ದಾಖಲೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕುತ್ತದೆ.',

    exportShareReportTitle: 'ಕೃಷಿ ವರದಿ ರಫ್ತು ಮತ್ತು ಹಂಚಿಕೆ',
    exportShareReportSubtitle: 'WhatsApp, ಇಮೇಲ್ ಅಥವಾ Google Drive ಮೂಲಕ ದೈನಂದಿನ ಅಥವಾ ಋತುವಿನ ವರದಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
    exportReportButton: 'ವರದಿ ರಫ್ತು ಮಾಡಿ',
    exportPdfReport: 'PDF ವರದಿ ರಫ್ತು ಮಾಡಿ',
    exportPdfReportDesc: 'ಆದಾಯ, ಖರ್ಚು, ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳು, ಕೊಯ್ಲು ಮತ್ತು ಬೆಳೆ ಹಂತಗಳ ವಿವರವಾದ PDF ವರದಿ.',
    exportCsvReport: 'Excel (.csv) ಶೀಟ್ ರಫ್ತು ಮಾಡಿ',
    exportCsvReportDesc: 'Microsoft Excel ಮತ್ತು Google Sheets ನಲ್ಲಿ ತೆರೆಯಬಹುದಾದ ಸ್ಪ್ರೆಡ್‌ಶೀಟ್.',
    exportGeneratingPdf: 'PDF ವರದಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…',
    exportGeneratingCsv: 'Excel (.csv) ಶೀಟ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…',
    exportSuccessPdf: 'PDF ವರದಿ ಹಂಚಿಕೊಳ್ಳಲು ಸಿದ್ಧವಾಗಿದೆ.',
    exportSuccessCsv: 'Excel (.csv) ಶೀಟ್ ಹಂಚಿಕೊಳ್ಳಲು ಸಿದ್ಧವಾಗಿದೆ.',
    exportErrorGeneric: 'ವರದಿಯನ್ನು ರಫ್ತು ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    exportSharingUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಫೈಲ್ ಹಂಚಿಕೆ ಲಭ್ಯವಿಲ್ಲ.',
    sharePdfDialogTitle: 'ಬಿಎಸ್ ಡೈರಿ (ಭೂಮಿಶಕ್ತಿ) PDF ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ',
    shareCsvDialogTitle: 'ಬಿಎಸ್ ಡೈರಿ (ಭೂಮಿಶಕ್ತಿ) Excel (.csv) ಶೀಟ್ ಹಂಚಿಕೊಳ್ಳಿ',
    reportSummaryHeading: 'ಹೊಲದ ಸಾರಾಂಶ ಮತ್ತು ಆರ್ಥಿಕ ವಿವರ',
    reportFinanceHeading: 'ಆದಾಯ ಮತ್ತು ಖರ್ಚುಗಳು',
    reportHarvestsHeading: 'ಕೊಯ್ಲು ದಾಖಲೆಗಳು',
    reportActivitiesHeading: 'ದೈನಂದಿನ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳು',
    reportCropSchedulesHeading: 'ಸ್ವಯಂಚಾಲಿತ ಬೆಳೆ ಬೆಳವಣಿಗೆ ವೇಳಾಪಟ್ಟಿ',
    reportGeneratedOn: 'ರಚಿಸಿದ ದಿನಾಂಕ',
    reportNoRecords: 'ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.',
    reportWorkspaceLabel: 'ಕಾರ್ಯಕ್ಷೇತ್ರ',
  },
  hi: {
    tagline: 'हर खेत की कहानी, एक ही डायरी में',
    greeting: 'आपका खेत, आपकी कहानी।',
    intro: 'अपने रोज़ के कृषि कार्य, खर्च और मौसम के रिकॉर्ड एक जगह रखें।',
    addActivity: 'गतिविधि जोड़ें', activities: 'गतिविधियाँ', plots: 'खेत के हिस्से', season: 'वर्तमान सीज़न',
    recentActivities: 'हाल की गतिविधियाँ', viewAll: 'सभी देखें', noActivities: 'अभी कोई गतिविधि नहीं',
    startDiary: 'अपनी डायरी शुरू करने के लिए पहली कृषि गतिविधि जोड़ें।', farmerTools: 'किसान उपकरण',
    toolsComingSoon: 'मौसम सलाह, भूमि इकाई रूपांतरण और खेती के लाभ की योजना अगले चरण में जोड़ी जाएगी।',
    diary: 'खेत की डायरी', diarySubtitle: 'आपके खेत में होने वाले काम का सरल रिकॉर्ड।',
    home: 'होम', farm: 'खेत', records: 'रिकॉर्ड', more: 'और', myFarm: 'मेरा खेत',
    settingsSubtitle: 'भाषा और ऐप की प्राथमिकताएँ', language: 'ऐप की भाषा',
    privacyTitle: 'आपका डेटा, आपका नियंत्रण', privacyText: 'डायरी की प्रविष्टियाँ हमेशा पहले इसी डिवाइस पर सेव होती हैं और पूरी तरह ऑफ़लाइन काम करती हैं। साइन इन करना वैकल्पिक है और यह केवल आपके रिकॉर्ड को आपके अपने खाते में बैकअप करता है।',
    activityTitle: 'गतिविधि का नाम', activityPlaceholder: 'जैसे सोयाबीन के खेत में पानी दिया',
    category: 'गतिविधि का प्रकार', notes: 'नोट्स (वैकल्पिक)', notesPlaceholder: 'मात्रा, खर्च या अन्य जानकारी…',
    saveActivity: 'गतिविधि सेव करें', localNote: 'इसी डिवाइस पर सेव होगा, और साइन इन होने पर आपके खाते में बैकअप भी होगा।',
    requiredTitle: 'गतिविधि ज़रूरी है', enterActivity: 'आगे बढ़ने के लिए गतिविधि का नाम लिखें।',
    deleteEntry: 'गतिविधि हटाएँ?', deleteConfirm: 'यह गतिविधि इस डिवाइस से हट जाएगी।',
    cancel: 'रद्द करें', delete: 'हटाएँ',

    save: 'सेव करें', today: 'आज', invalidDate: 'सही तारीख़ YYYY-MM-DD रूप में लिखें।',
    requiredField: 'यह फ़ील्ड ज़रूरी है।',
    deleteConfirmGeneric: 'यह रिकॉर्ड इस डिवाइस से हट जाएगा।',
    editActivity: 'गतिविधि संपादित करें', noneOption: 'कोई नहीं',

    profileTab: 'प्रोफ़ाइल', plotsTab: 'खेत के हिस्से', cropsTab: 'फसलें',
    farmName: 'खेत का नाम', farmNamePlaceholder: 'जैसे ग्रीन वैली फ़ार्म',
    farmerName: 'किसान का नाम', farmerNamePlaceholder: 'जैसे रमेश कुमार',
    village: 'गाँव', villagePlaceholder: 'जैसे होसहल्ली',
    district: 'ज़िला', districtPlaceholder: 'जैसे मैसूर',
    stateField: 'राज्य', statePlaceholder: 'जैसे कर्नाटक',
    totalArea: 'कुल भूमि क्षेत्रफल', unit: 'इकाई',
    profileIntro: 'यह जानकारी इसी डिवाइस पर रहती है और आपकी डायरी को निजी बनाने में मदद करती है।',

    addPlot: 'हिस्सा जोड़ें', editPlot: 'हिस्सा संपादित करें', plotName: 'हिस्से का नाम', plotNamePlaceholder: 'जैसे उत्तरी खेत',
    plotArea: 'क्षेत्रफल', noPlotsYet: 'अभी कोई हिस्सा नहीं', addFirstPlot: 'अपने खेत को दर्ज करने के लिए पहला हिस्सा जोड़ें।',
    deletePlot: 'हिस्सा हटाएँ?', noPlotLinked: 'कोई हिस्सा नहीं जोड़ा गया',

    addCrop: 'फसल जोड़ें', editCrop: 'फसल संपादित करें', cropName: 'फसल का नाम', cropNamePlaceholder: 'जैसे सोयाबीन',
    seasonField: 'सीज़न', linkToPlot: 'हिस्सा (वैकल्पिक)', linkToCrop: 'फसल (वैकल्पिक)',
    sowingDate: 'बुवाई की तारीख़', expectedHarvestDate: 'अनुमानित कटाई तारीख़ (वैकल्पिक)',
    noCropsYet: 'अभी कोई फसल नहीं', addFirstCrop: 'सीज़न दर्ज करने के लिए पहली फसल जोड़ें।',
    deleteCrop: 'फसल हटाएँ?', noCropLinked: 'कोई फसल नहीं जोड़ी गई',

    expenses: 'खर्च', income: 'आय', addExpense: 'खर्च जोड़ें', addIncome: 'आय जोड़ें',
    editExpense: 'खर्च संपादित करें', editIncome: 'आय संपादित करें', amount: 'राशि (₹)', amountPlaceholder: 'जैसे 1500',
    financeCategory: 'श्रेणी', financeDate: 'तारीख़', invalidAmount: 'शून्य से बड़ी सही राशि लिखें।',
    noExpensesYet: 'अभी कोई खर्च नहीं', addFirstExpense: 'खेती का खर्च दर्ज करने के लिए पहला खर्च जोड़ें।',
    noIncomeYet: 'अभी कोई आय नहीं', addFirstIncome: 'खेती की आय दर्ज करने के लिए पहली आय जोड़ें।',
    deleteExpense: 'खर्च हटाएँ?', deleteIncome: 'आय हटाएँ?',
    totalExpenses: 'कुल खर्च', totalIncome: 'कुल आय', netBalance: 'शुद्ध शेष',
    netBalanceNote: 'केवल दर्ज किए गए खर्च और आय से गणना की गई।',

    harvests: 'कटाई', addHarvest: 'कटाई जोड़ें', editHarvest: 'कटाई संपादित करें', harvestDate: 'कटाई की तारीख़',
    quantity: 'मात्रा', sellingPrice: 'प्रति इकाई बिक्री मूल्य (वैकल्पिक)', buyer: 'ख़रीदार (वैकल्पिक)',
    noHarvestsYet: 'अभी कोई कटाई दर्ज नहीं', addFirstHarvest: 'फसल कटने के बाद पहला कटाई रिकॉर्ड जोड़ें।',
    deleteHarvest: 'कटाई रिकॉर्ड हटाएँ?', totalValue: 'कुल मूल्य', valueNotRecorded: 'दर्ज नहीं',

    recordsOverviewTab: 'सारांश', financeTab: 'खर्च और आय', harvestsTab: 'कटाई',
    totalActivities: 'कुल गतिविधियाँ', seasonalHistory: 'सीज़न इतिहास', noDataYet: 'अभी कोई डेटा नहीं',

    backupRestore: 'रिपोर्ट निर्यात और पुनर्स्थापना',
    exportData: 'रिपोर्ट निर्यात और साझा करें',
    exportDescription: 'अपने खेत का सारांश, दैनिक कार्य, खर्च-आय, कटाई और फसल कैलेंडर की फ़ॉर्मेटेड PDF रिपोर्ट या Excel (.csv) शीट बनाएं और साझा करें।',
    shareBackup: 'रिपोर्ट निर्यात और साझा करें (PDF / Excel)', copyToClipboard: 'क्लिपबोर्ड पर कॉपी करें', copied: 'क्लिपबोर्ड पर कॉपी हो गया।',
    restoreData: 'बैकअप से पुनर्स्थापित करें',
    restoreDescription: 'पुनर्स्थापित करने से पहले पूर्वावलोकन के लिए नीचे पहले से निर्यात किया गया बैकअप पेस्ट करें।',
    pasteBackupPlaceholder: 'बैकअप टेक्स्ट यहाँ पेस्ट करें…',
    previewRestore: 'पुनर्स्थापना पूर्वावलोकन',
    restoreWarningTitle: 'सारा डेटा बदलें?',
    replaceDataWarning: 'यह इस डिवाइस के सारे मौजूदा डेटा को इस बैकअप की सामग्री से स्थायी रूप से बदल देगा। इसे पूर्ववत नहीं किया जा सकता।',
    recordsFoundInBackup: 'बैकअप में मिले रिकॉर्ड', currentRecordsOnDevice: 'इस डिवाइस पर मौजूदा रिकॉर्ड',
    invalidBackupFile: 'यह मान्य BhoomiShakti बैकअप नहीं लगता।', restoreSuccess: 'डेटा सफलतापूर्वक पुनर्स्थापित हुआ।',
    confirmRestore: 'बदलें और पुनर्स्थापित करें',

    account: 'खाता', accountIntro: 'अपने कृषि डेटा को क्लाउड पर बैकअप करने और दूसरे डिवाइस पर उपयोग करने के लिए साइन इन करें। ऐप ऑफ़लाइन भी काम करता रहेगा।',
    signedInAs: 'साइन इन है', signOut: 'साइन आउट',
    signIn: 'साइन इन', createAccount: 'खाता बनाएं', emailField: 'ईमेल', emailPlaceholder: 'you@example.com',
    passwordField: 'पासवर्ड', passwordPlaceholder: 'कम से कम 6 अक्षर', forgotPassword: 'पासवर्ड भूल गए?',
    resetPasswordSent: 'अगर इस ईमेल से खाता है, तो रीसेट लिंक भेज दिया गया है।',
    orDivider: 'या', continueWithGoogle: 'Google से जारी रखें',
    switchToSignIn: 'पहले से खाता है? साइन इन करें', switchToSignUp: 'खाता नहीं है? एक बनाएं',
    cloudSyncNotConfigured: 'इस ऐप के लिए क्लाउड सिंक अभी सेट नहीं है।',
    authErrorInvalidEmail: 'सही ईमेल पता लिखें।',
    authErrorEmailInUse: 'इस ईमेल से खाता पहले से मौजूद है। इसके बजाय साइन इन करें।',
    authErrorWeakPassword: 'कम से कम 6 अक्षरों का पासवर्ड चुनें।',
    authErrorWrongCredentials: 'ग़लत ईमेल या पासवर्ड।',
    authErrorTooManyRequests: 'बहुत ज़्यादा प्रयास हो गए। थोड़ी देर बाद फिर कोशिश करें।',
    authErrorNetwork: 'नेटवर्क त्रुटि। अपना कनेक्शन जांचें और फिर कोशिश करें।',
    authErrorPopupClosed: 'साइन-इन रद्द कर दिया गया।',
    authErrorGeneric: 'कुछ गलत हो गया। कृपया फिर कोशिश करें।',
    authErrorGoogleNeedsDevBuild: 'इस डिवाइस पर Google साइन-इन के लिए ऐप की डेवलपमेंट बिल्ड चाहिए, Expo Go नहीं। यह अभी वेब वर्शन पर काम करता है।',

    claimLocalDataTitle: 'अपना मौजूदा डेटा उपयोग करें?',
    claimLocalDataMessage: 'साइन इन करने से पहले इस डिवाइस पर सेव किए गए कृषि रिकॉर्ड आपके पास हैं। क्या इन्हें अपने खाते में जोड़कर क्लाउड पर बैकअप करें?',
    claimLocalDataConfirm: 'हां, यह डेटा उपयोग करें', claimLocalDataSkip: 'नहीं, नए सिरे से शुरू करें',

    syncNow: 'अभी सिंक करें', syncing: 'सिंक हो रहा है…', syncSuccess: 'अप टू डेट', syncError: 'सिंक विफल, फिर कोशिश होगी',
    lastSynced: 'आख़िरी सिंक', neverSynced: 'कभी सिंक नहीं हुआ',
    syncDescription: 'आपके कृषि रिकॉर्ड आपके खाते में बैकअप हैं और किसी अन्य डिवाइस पर साइन इन करने पर उपलब्ध होंगे।',
    deleteAccount: 'खाता हटाएं',
    deleteAccountIntro: 'इससे आपका खाता, आपका क्लाउड बैकअप, और इस डिवाइस पर मौजूद आपके कृषि डेटा की प्रति स्थायी रूप से हट जाएगी। इसे पूर्ववत नहीं किया जा सकता।',
    deleteAccountWarning: 'आगे बढ़ने से पहले बैकअप निर्यात करने की सलाह दी जाती है।',
    deleteAccountExportFirst: 'पहले बैकअप निर्यात करें',
    deleteAccountExportButton: 'बैकअप निर्यात करें',
    deleteAccountPasswordPrompt: 'पुष्टि के लिए अपना पासवर्ड दर्ज करें।',
    deleteAccountConfirmField: 'वर्तमान पासवर्ड',
    deleteAccountConfirmButton: 'मेरा खाता स्थायी रूप से हटाएं',
    deleteAccountCancel: 'रद्द करें',
    deleteAccountStepReauth: 'आपकी पहचान की पुष्टि हो रही है…',
    deleteAccountStepCloud: 'आपका क्लाउड डेटा हटाया जा रहा है…',
    deleteAccountStepLocal: 'इस डिवाइस से डेटा हटाया जा रहा है…',
    deleteAccountStepAuth: 'आपका खाता हटाया जा रहा है…',
    deleteAccountSuccess: 'आपका खाता और डेटा हटा दिया गया है।',
    deleteAccountPartialFailure: 'कुछ चरण पूरे नहीं हुए। दोबारा प्रयास करना सुरक्षित है — जो पहले ही हट चुका है वह न तो दोहराया जाएगा न ही खोएगा।',
    deleteAccountNeedsPassword: 'आगे बढ़ने के लिए अपना पासवर्ड दर्ज करें।',
    deleteAccountGoogleNativeUnsupported: 'इस डिवाइस से Google खाता हटाना अभी समर्थित नहीं है। कृपया इस खाते को हटाने के लिए वेब ऐप का उपयोग करें।',
    deleteAccountDone: 'पूर्ण हुआ',
    deleteAccountExported: 'बैकअप निर्यात हो गया।',
    deleteAccountStepWaitingSync: 'आगे बढ़ने से पहले लंबित सिंक पूरा किया जा रहा है…',
    deleteAccountSyncBusy: 'सिंक पूरा होने में अपेक्षा से अधिक समय लग रहा है। कृपया कुछ देर बाद फिर से प्रयास करें।',
    deleteAccountStepLock: 'हटाने के लिए आपका खाता सुरक्षित किया जा रहा है…',

    workspaces: 'कार्यक्षेत्र',
    workspacesSubtitle: 'विभिन्न कृषि भूखंडों को अलग-अलग कार्यक्षेत्र के रूप में प्रबंधित करें।',
    addWorkspace: 'कार्यक्षेत्र जोड़ें',
    editWorkspace: 'कार्यक्षेत्र संपादित करें',
    workspaceName: 'कार्यक्षेत्र का नाम',
    workspaceNamePlaceholder: 'उदा. दक्षिण फ़ार्म / जैविक प्लॉट',
    defaultWorkspaceName: 'डिफ़ॉल्ट',
    exportSeasonReport: 'सीज़न रिपोर्ट निर्यात करें (PDF)',

    cropStageCalendarTitle: 'स्वचालित फसल विकास कैलेंडर',
    cropStageCalendarSubtitle: 'कार्यक्षेत्र-आधारित विकास चरण और कृषि संबंधी सुझाव',
    cropInputLabel: 'फसल का नाम',
    cropInputPlaceholder: 'अपनी फसल का नाम दर्ज करें (उदा. धान, गेहूं, कपास, मक्का…)',
    sowingDateLabel: 'बुआई की तारीख (YYYY-MM-DD)',
    quickPick: 'त्वरित चयन:',
    trackedInWorkspace: 'कार्यक्षेत्र में ट्रैक की जा रही फसलें:',
    newCropPlan: '＋ नई फसल',
    growthSchedule: 'विकास अनुसूची',
    activeNow: 'वर्तमान में सक्रिय',
    stageCompleted: 'पूर्ण हुआ',
    stageUpcoming: 'आगामी',
    irrigation: 'सिंचाई',
    fertilizerNutrition: 'उर्वरक एवं पोषण',
    trackingActive: '✓ इस कार्यक्षेत्र में ट्रैकिंग सक्रिय है',
    deleteSchedule: 'कैलेंडर हटाएं',
    deleteScheduleTitle: 'कैलेंडर हटाएं?',
    deleteScheduleConfirm: 'क्या आप {name} का विकास कैलेंडर हटाना चाहते हैं?',
    saveScheduleToWorkspace: 'कैलेंडर कार्यक्षेत्र में सहेजें',
    savingSchedule: 'सहेजा जा रहा है…',
    daysGrowth: 'कुल विकास दिवस',
    cropMatured: 'फसल परिपक्व हो गई',
    sowingInDays: 'बुआई में शेष दिन',
    stageLabel: 'चरण',
    stageGermination: 'अंकुरण',
    stageVegetative: 'वानस्पतिक वृद्धि',
    stageFlowering: 'फूल/फल बनना',
    stageHarvest: 'कटाई',
    voiceInputStart: 'आवाज से इनपुट शुरू करें',
    voiceInputStop: 'आवाज इनपुट रोकें',
    farmerAccount: 'किसान खाता और क्लाउड सिंक',
    createFarmerAccount: 'किसान खाता बनाएं',
    villageOrFarm: 'गाँव / खेत का नाम',
    villageOrFarmPlaceholder: 'उदा: रामपुर, मण्ड्या',
    farmerNamePlaceholderInput: 'उदा: रमेश पाटिल',
    offlineNotice: 'आपकी डायरी 100% ऑफ़लाइन काम करती है। डेटा आपके फ़ोन के SQLite में सुरक्षित रहता है और इंटरनेट होने पर क्लाउड से सिंक हो जाता है।',
    farmerAccountSubtitle: 'अपनी डायरी की प्रविष्टियाँ, फसल कैलेंडर और कृषि डेटा को सुरक्षित क्लाउड पर बैकअप करें।',
    syncingWithCloud: 'आपके कृषि रिकॉर्ड को क्लाउड से सिंक किया जा रहा है…',
    syncedJustNow: 'अभी-अभी सिंक हुआ',
    syncFailed: 'क्लाउड सिंक पूरा नहीं हो सका। आपका स्थानीय डेटा पूरी तरह सुरक्षित है।',
    syncStatusActive: 'सक्रिय',
    syncStatusFailed: 'विफल',
    verificationEmailSent: 'सत्यापन ईमेल भेज दिया गया है! अपना खाता सत्यापित करने के लिए इनबॉक्स जांचें।',
    emailNotVerified: 'ईमेल अभी सत्यापित नहीं है',
    emailVerified: 'सत्यापित',
    resendVerificationEmail: 'सत्यापन ईमेल फिर से भेजें',
    notificationsTitle: 'कृषि अनुस्मारक और सूचनाएं',
    notificationsSubtitle: 'फसल अवस्था की सुबह की सूचनाएं और दैनिक शाम की डायरी याद दिलाने वाले अलर्ट।',
    dailyReminder: 'दैनिक शाम 7:00 बजे डायरी अनुस्मारक',
    dailyReminderSubtitle: 'दिनभर की गतिविधियों, खर्चों और उपज को दर्ज करने के लिए हर शाम 7:00 बजे सूचना।',
    dailyReminderNotifTitle: 'दैनिक कृषि डायरी अनुस्मारक',
    dailyReminderNotifBody: 'आज के कृषि कार्य, खर्च और कटाई का विवरण अपनी डायरी में दर्ज करना न भूलें।',
    notificationPermissionDenied: 'नोटिफिकेशन अनुमति नहीं मिली। कृपया फ़ोन सेटिंग्स में इसे चालू करें।',
    cropMilestonesActive: 'फसल अवस्था के महत्वपूर्ण दिनों पर सुबह 7:00 बजे सूचनाएं निर्धारित की गई हैं।',

    daysCultivatedLabel: 'बुआई के बाद बीते दिन',
    daysCultivatedPlaceholder: 'उदा. 45',
    totalCropDaysLabel: 'कुल फसल अवधि (दिन)',
    totalCropDaysPlaceholder: 'उदा. 150 (5+ माह)',
    defaultDurationHint: 'सामान्य अवधि: {days} दिन',
    monthsApprox: '~{months} माह',
    popularCropsLabel: 'प्रमुख फसलें:',
    bsjdkSystemLabel: 'BSJDK पोषण एवं देखभाल',
    dayWord: 'दिन',
    dayShort: 'दि',
    daysRangeLabel: 'दिन',
    daysUnit: 'दिन',
    customCropDefault: 'अन्य फसल',

    interactiveHub: 'किसान केंद्र',
    toolWeather: 'मौसम',
    toolLandUnit: 'भूमि इकाई',
    toolProfitPlanner: 'लाभ योजना',
    weatherHumidity: 'नमी',
    weatherWind: 'हवा गति',
    weatherRainChance: 'बारिश संभावना',
    weatherHighLow: 'अधिकतम {high}° / न्यूनतम {low}°',
    weatherKmhUnit: 'किमी/घं',
    weatherActivePlots: 'सक्रिय खेत',
    weatherSprayAdvisoryTitle: 'छिड़काव एवं कृषि सलाह',
    weatherIrrigationAdvisoryTitle: 'सिंचाई सलाह',
    weatherUpdating: 'ताज़ा मौसम प्राप्त किया जा रहा है…',
    weatherRefresh: 'रिफ़्रेश करें',
    weatherUseGps: 'GPS उपयोग करें',
    weatherSearchPlaceholder: 'गाँव / ज़िला (जैसे मण्ड्या)',
    weatherSearchBtn: 'खोजें',
    weatherLastUpdated: 'आख़िरी अपडेट',
    weatherOfflineCached: 'ऑफ़लाइन — सहेजा गया मौसम',
    weatherNoData: 'ताज़ा मौसम देखने के लिए इंटरनेट से जुड़ें या अपना गाँव/ज़िला दर्ज करें।',
    weatherGpsFallbackNotice: 'लोकेशन अनुमति नहीं मिली — आपके खेत के क्षेत्र का मौसम दिखाया जा रहा है।',
    weatherLocationNotFound: 'उस क्षेत्र का मौसम नहीं मिला। ज़िले का नाम लिखकर देखें।',
    weatherClear: 'साफ़ आसमान',
    weatherMainlyClear: 'लगभग साफ़',
    weatherPartlyCloudy: 'आंशिक बादल',
    weatherOvercast: 'घने बादल',
    weatherFoggy: 'कोहरा / धुंध',
    weatherDrizzle: 'हल्की बूंदाबांदी',
    weatherRain: 'बारिश',
    weatherHeavyRain: 'तेज़ बारिश',
    weatherShowers: 'बौछारें',
    weatherThunderstorm: 'आंधी-तूफ़ान',
    weatherSprayAvoidRain: 'बारिश या बारिश की उच्च संभावना के कारण आज BSJDK पत्तियों पर छिड़काव या जैव-घोल न छिड़कें।',
    weatherSprayAvoidWind: 'हवा तेज़ है (≥18 किमी/घं) — छिड़काव बहने से बचाने के लिए अभी स्प्रे न करें। शांत सुबह या शाम की प्रतीक्षा करें।',
    weatherSprayHotDry: 'गर्म और शुष्क मौसम है — पत्तियों को झुलसने से बचाने के लिए दोपहर में छिड़काव न करें। सुबह 9 बजे से पहले करें।',
    weatherSprayHighHumidity: 'अधिक नमी (≥85%) — घनी फसलों में फफूंद रोग की जांच करें और हवा का प्रवाह बनाए रखें।',
    weatherSprayOptimal: 'शांत हवा और अनुकूल मौसम — BSJDK जीवधारा पर्ण छिड़काव और निराई-गुड़ाई के लिए उत्तम समय है।',
    weatherIrrigRainExpected: 'बारिश की संभावना है या हो रही है — निर्धारित सिंचाई रोक दें और खेत से पानी निकलने की नालियां साफ़ रखें।',
    weatherIrrigWindy: 'हवा मध्यम तेज़ है — वाष्पीकरण कम करने के लिए सुबह जल्दी टपक या नाली से सिंचाई करें।',
    weatherIrrigHotDry: 'तेज़ गर्मी और वाष्पीकरण — शाम या सुबह हल्की सिंचाई दें और मिट्टी में मल्चिंग बनाए रखें।',
    weatherIrrigHighHumidity: 'नमी अधिक है — सिंचाई का अंतराल बढ़ाएं और जड़ों के पास जलभराव न होने दें।',
    weatherIrrigOptimal: 'संतुलित मौसम — तय अनुसूची के अनुसार चरणबद्ध सिंचाई और BSJDK नमी संरक्षण जारी रखें।',
    landConverterDesc: 'क्षेत्रीय और मानक इकाइयों के बीच भूमि माप को तुरंत बदलें।',
    enterArea: 'क्षेत्रफल दर्ज करें',
    selectUnit: 'इकाई चुनें',
    profitPlannerDesc: 'अपनी उपज से अनुमानित आय, खर्च और शुद्ध लाभ की गणना करें।',
    expectedYieldKg: 'अनुमानित उपज (किलो)',
    pricePerKg: 'प्रति किलो मूल्य (₹)',
    estimatedExpensesLabel: 'अनुमानित खर्च (₹)',
    projectedRevenue: 'अनुमानित आय',
    estimatedExpensesSummary: 'अनुमानित खर्च',
    netProjectedProfit: 'अनुमानित शुद्ध लाभ',
    netProjectedLoss: 'अनुमानित शुद्ध हानि',
    profitMargin: 'लाभ प्रतिशत',
    vaultTitle: 'रसीद और मिट्टी रिपोर्ट वॉल्ट',
    vaultSubtitle: 'बिल, मंडी पर्ची और मिट्टी जांच रिपोर्ट का कार्यक्षेत्र-आधारित संग्रह',
    vaultTakePhoto: 'फ़ोटो खींचें',
    vaultUploadGallery: 'गैलरी से चुनें',
    vaultFilterAll: 'सभी',
    vaultCatFertilizerBill: 'खाद बिल',
    vaultCatMandiSlip: 'मंडी पर्ची',
    vaultCatSoilReport: 'मिट्टी रिपोर्ट',
    vaultCatOther: 'अन्य',
    vaultEmptyTitle: 'कोई दस्तावेज़ सहेजा नहीं गया',
    vaultEmptyAll: 'इस कार्यक्षेत्र में सुरक्षित रखने के लिए खाद बिल या मिट्टी रिपोर्ट की फ़ोटो लें।',
    vaultEmptyCategory: '"{category}" श्रेणी में कोई दस्तावेज़ नहीं है।',
    vaultSaveModalTitle: 'वॉल्ट में दस्तावेज़ सहेजें',
    vaultDocTitleLabel: 'दस्तावेज़ का शीर्षक *',
    vaultDocTitlePlaceholder: 'उदा. BSJDK / कृषि बिल - मई 2026',
    vaultCategoryLabel: 'श्रेणी *',
    vaultSaveBtn: 'वॉल्ट में सहेजें',
    vaultSavingBtn: 'सहेजा जा रहा है…',
    vaultPermRequiredTitle: 'अनुमति आवश्यक है',
    vaultCameraPermMsg: 'बिल और मिट्टी रिपोर्ट की फ़ोटो लेने के लिए कैमरा अनुमति आवश्यक है।',
    vaultGalleryPermMsg: 'बिल और मिट्टी रिपोर्ट चुनने के लिए गैलरी अनुमति आवश्यक है।',
    vaultCameraErrorTitle: 'कैमरा त्रुटि',
    vaultCameraErrorMsg: 'कैमरा नहीं खुल सका। कृपया फिर से प्रयास करें।',
    vaultGalleryErrorTitle: 'गैलरी त्रुटि',
    vaultGalleryErrorMsg: 'गैलरी नहीं खुल सकी। कृपया फिर से प्रयास करें।',
    vaultTitleRequiredTitle: 'शीर्षक आवश्यक है',
    vaultTitleRequiredMsg: 'कृपया इस दस्तावेज़ के लिए शीर्षक या विवरण दर्ज करें।',
    vaultSaveErrorTitle: 'सहेजने में त्रुटि',
    vaultSaveErrorMsg: 'दस्तावेज़ वॉल्ट में सहेजा नहीं जा सका। कृपया फिर से प्रयास करें।',
    vaultDeleteTitle: 'दस्तावेज़ हटाएं',
    vaultDeleteConfirm: 'क्या आप "{title}" को हटाना चाहते हैं? इससे फ़ोटो और रिकॉर्ड स्थायी रूप से हट जाएंगे।',

    exportShareReportTitle: 'कृषि रिपोर्ट निर्यात एवं साझा करें',
    exportShareReportSubtitle: 'WhatsApp, ईमेल या Google Drive पर दैनिक या सीज़न की रिपोर्ट साझा करें।',
    exportReportButton: 'रिपोर्ट निर्यात करें',
    exportPdfReport: 'PDF रिपोर्ट निर्यात करें',
    exportPdfReportDesc: 'आय, खर्च, दैनिक कार्य, कटाई और फसल अवस्थाओं की सुंदर PDF रिपोर्ट।',
    exportCsvReport: 'Excel (.csv) शीट निर्यात करें',
    exportCsvReportDesc: 'Microsoft Excel और Google Sheets में खुलने वाली स्प्रेडशीट।',
    exportGeneratingPdf: 'PDF रिपोर्ट तैयार हो रही है…',
    exportGeneratingCsv: 'Excel (.csv) शीट तैयार हो रही है…',
    exportSuccessPdf: 'PDF रिपोर्ट साझा करने के लिए तैयार है।',
    exportSuccessCsv: 'Excel (.csv) शीट साझा करने के लिए तैयार है।',
    exportErrorGeneric: 'रिपोर्ट निर्यात नहीं हो सकी। कृपया फिर से प्रयास करें।',
    exportSharingUnavailable: 'इस डिवाइस पर फ़ाइल साझा करने की सुविधा उपलब्ध नहीं है।',
    sharePdfDialogTitle: 'BS डायरी (भूमि शक्ति) PDF रिपोर्ट साझा करें',
    shareCsvDialogTitle: 'BS डायरी (भूमि शक्ति) Excel (.csv) शीट साझा करें',
    reportSummaryHeading: 'खेत सारांश एवं वित्तीय विवरण',
    reportFinanceHeading: 'आय और खर्च',
    reportHarvestsHeading: 'कटाई रिकॉर्ड',
    reportActivitiesHeading: 'दैनिक कृषि गतिविधियाँ',
    reportCropSchedulesHeading: 'स्वचालित फसल विकास अनुसूची',
    reportGeneratedOn: 'निर्माण तिथि',
    reportNoRecords: 'अभी कोई रिकॉर्ड दर्ज नहीं है।',
    reportWorkspaceLabel: 'कार्यक्षेत्र',
  },
};
