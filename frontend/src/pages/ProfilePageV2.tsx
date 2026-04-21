import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Lock, LogOut, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { changePassword, updateProfile } from '../services/auth.service';
import { getPersonalization, updateRoutine } from '../services/health.service';
import type { User } from '../types';

type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';
type GoalType = 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
type GenderValue = '' | 'MALE' | 'FEMALE' | 'OTHER';

type ProfileFormState = {
  fullName: string;
  gender: GenderValue;
  dateOfBirth: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  dietaryPrefText: string;
  allergiesText: string;
  targetCalories: string;
  targetProtein: string;
  targetFat: string;
  targetCarbs: string;
  goalType: GoalType;
  targetWeight: string;
};

type RoutineFormState = {
  wakeUpAt: string;
  sleepAt: string;
  breakfastAt: string;
  lunchAt: string;
  dinnerAt: string;
  waterGoalMl: string;
  remindersEnabled: boolean;
};

const DEFAULT_ROUTINE: RoutineFormState = {
  wakeUpAt: '06:30',
  sleepAt: '23:00',
  breakfastAt: '07:30',
  lunchAt: '12:30',
  dinnerAt: '19:00',
  waterGoalMl: '2200',
  remindersEnabled: true,
};

const ACTIVITY_OPTIONS: ActivityLevel[] = ['SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'];
const GOAL_OPTIONS: GoalType[] = ['WEIGHT_LOSS', 'MAINTENANCE', 'WEIGHT_GAIN', 'MUSCLE_GAIN'];
const GENDER_OPTIONS: GenderValue[] = ['', 'MALE', 'FEMALE', 'OTHER'];

const toDateInputValue = (raw?: string) => {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toNumberString = (value?: number) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '';
  return String(value);
};

const parseOptionalNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
};

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const buildInitialForm = (user: User | null): ProfileFormState => {
  const profile = user?.profile;
  const activeGoal = user?.goals?.find((goal) => goal.isActive) || user?.goals?.[0];

  return {
    fullName: profile?.fullName || user?.name || '',
    gender: ((profile?.gender || '') as GenderValue) || '',
    dateOfBirth: toDateInputValue(profile?.dateOfBirth),
    height: toNumberString(profile?.height),
    weight: toNumberString(profile?.weight),
    activityLevel: (profile?.activityLevel as ActivityLevel) || 'MODERATE',
    dietaryPrefText: (profile?.dietaryPref || []).join(', '),
    allergiesText: (profile?.allergies || []).join(', '),
    targetCalories: toNumberString(activeGoal?.targetCalories ?? profile?.targetCalories ?? 2000),
    targetProtein: toNumberString(activeGoal?.targetProtein ?? profile?.targetProtein ?? 150),
    targetFat: toNumberString(activeGoal?.targetFat ?? profile?.targetFat ?? 55),
    targetCarbs: toNumberString(activeGoal?.targetCarbs ?? profile?.targetCarbs ?? 250),
    goalType: (activeGoal?.goalType as GoalType) || 'MAINTENANCE',
    targetWeight: toNumberString(activeGoal?.targetWeight),
  };
};

const getBmiStatus = (bmi: number | null, t: (key: string) => string) => {
  if (bmi === null) return t('profile.bmi.na');
  if (bmi < 18.5) return t('profile.bmi.underweight');
  if (bmi < 25) return t('profile.bmi.normal');
  if (bmi < 30) return t('profile.bmi.overweight');
  return t('profile.bmi.obese');
};

const ProfilePageV2 = () => {
  const { user, logout, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [initialForm, setInitialForm] = useState<ProfileFormState>(buildInitialForm(user));
  const [form, setForm] = useState<ProfileFormState>(buildInitialForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [routine, setRoutine] = useState<RoutineFormState>(DEFAULT_ROUTINE);
  const [routineLoading, setRoutineLoading] = useState(true);
  const [routineSaving, setRoutineSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const nextForm = buildInitialForm(user);
    setInitialForm(nextForm);
    setForm(nextForm);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    getPersonalization()
      .then((data) => {
        if (!mounted) return;
        const source = data?.routine;
        if (!source) {
          setRoutine(DEFAULT_ROUTINE);
          return;
        }
        setRoutine({
          wakeUpAt: source.wakeUpAt || DEFAULT_ROUTINE.wakeUpAt,
          sleepAt: source.sleepAt || DEFAULT_ROUTINE.sleepAt,
          breakfastAt: source.breakfastAt || DEFAULT_ROUTINE.breakfastAt,
          lunchAt: source.lunchAt || DEFAULT_ROUTINE.lunchAt,
          dinnerAt: source.dinnerAt || DEFAULT_ROUTINE.dinnerAt,
          waterGoalMl: String(source.waterGoalMl || DEFAULT_ROUTINE.waterGoalMl),
          remindersEnabled: source.remindersEnabled !== false,
        });
      })
      .finally(() => {
        if (mounted) setRoutineLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const bmi = (() => {
    const heightMeter = Number(form.height) / 100;
    const weight = Number(form.weight);
    if (!heightMeter || !weight) return null;
    return Number((weight / (heightMeter * heightMeter)).toFixed(1));
  })();

  const getActivityLabel = (value: ActivityLevel) => {
    const map: Record<ActivityLevel, string> = {
      SEDENTARY: t('profile.activity.sedentary'),
      LIGHT: t('profile.activity.light'),
      MODERATE: t('profile.activity.moderate'),
      ACTIVE: t('profile.activity.active'),
      VERY_ACTIVE: t('profile.activity.veryActive'),
    };
    return map[value];
  };

  const getGoalLabel = (value: GoalType) => {
    const map: Record<GoalType, string> = {
      WEIGHT_LOSS: t('profile.goal.weightLoss'),
      MAINTENANCE: t('profile.goal.maintenance'),
      WEIGHT_GAIN: t('profile.goal.weightGain'),
      MUSCLE_GAIN: t('profile.goal.muscleGain'),
    };
    return map[value];
  };

  const getGenderLabel = (value: GenderValue) => {
    const map: Record<GenderValue, string> = {
      '': t('profile.gender.none'),
      MALE: t('profile.gender.male'),
      FEMALE: t('profile.gender.female'),
      OTHER: t('profile.gender.other'),
    };
    return map[value];
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRoutineChange = (field: keyof RoutineFormState, value: string | boolean) => {
    setRoutine((current) => ({ ...current, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName.trim() || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        height: parseOptionalNumber(form.height),
        weight: parseOptionalNumber(form.weight),
        activityLevel: form.activityLevel,
        dietaryPref: parseCommaList(form.dietaryPrefText),
        allergies: parseCommaList(form.allergiesText),
        targetCalories: parseOptionalNumber(form.targetCalories),
        targetProtein: parseOptionalNumber(form.targetProtein),
        targetFat: parseOptionalNumber(form.targetFat),
        targetCarbs: parseOptionalNumber(form.targetCarbs),
        goalType: form.goalType,
        targetWeight: parseOptionalNumber(form.targetWeight),
      });

      await refreshUser();
      toast.success(t('profile.toast.profileUpdated'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('profile.toast.profileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    setForm(initialForm);
  };

  const handleSaveRoutine = async () => {
    setRoutineSaving(true);
    try {
      await updateRoutine({
        wakeUpAt: routine.wakeUpAt,
        sleepAt: routine.sleepAt,
        breakfastAt: routine.breakfastAt,
        lunchAt: routine.lunchAt,
        dinnerAt: routine.dinnerAt,
        waterGoalMl: Number(routine.waterGoalMl) || 2200,
        remindersEnabled: routine.remindersEnabled,
      });
      toast.success(t('profile.toast.routineUpdated'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('profile.toast.routineFailed'));
    } finally {
      setRoutineSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('profile.toast.passwordRequired'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('profile.toast.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.toast.passwordMismatch'));
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('profile.toast.passwordChanged'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('profile.toast.passwordChangeFailed'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">{t('profile.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {t('profile.subtitle')}
            </p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-600 px-4 py-2 text-sm font-bold"
          >
            <LogOut size={16} />
            {t('profile.logout')}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.fullName')}</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.email')}</span>
              <input
                value={user?.email || ''}
                disabled
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 px-4 py-2.5 text-gray-500 dark:text-slate-400"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.gender')}</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              >
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getGenderLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.dateOfBirth')}</span>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.height')}</span>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.weight')}</span>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.activityLevel')}</span>
              <select
                name="activityLevel"
                value={form.activityLevel}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {getActivityLabel(option)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.dietaryPref')}</span>
              <textarea
                name="dietaryPrefText"
                value={form.dietaryPrefText}
                onChange={handleInputChange}
                rows={3}
                placeholder="vd: vegetarian, low sugar"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.allergies')}</span>
              <textarea
                name="allergiesText"
                value={form.allergiesText}
                onChange={handleInputChange}
                rows={3}
                placeholder="vd: peanut, seafood"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-slate-100">{t('profile.nutritionGoals')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.goalType')}</span>
                <select
                  name="goalType"
                  value={form.goalType}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                >
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {getGoalLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.targetWeight')}</span>
                <input
                  type="number"
                  name="targetWeight"
                  value={form.targetWeight}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.targetCalories')}</span>
                <input
                  type="number"
                  name="targetCalories"
                  value={form.targetCalories}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.targetProtein')}</span>
                <input
                  type="number"
                  name="targetProtein"
                  value={form.targetProtein}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.targetFat')}</span>
                <input
                  type="number"
                  name="targetFat"
                  value={form.targetFat}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.targetCarbs')}</span>
                <input
                  type="number"
                  name="targetCarbs"
                  value={form.targetCarbs}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-slate-100">{t('profile.routineTitle')}</h2>
              {routineLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.wakeUpAt')}</span>
                <input
                  type="time"
                  value={routine.wakeUpAt}
                  onChange={(event) => handleRoutineChange('wakeUpAt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.breakfastAt')}</span>
                <input
                  type="time"
                  value={routine.breakfastAt}
                  onChange={(event) => handleRoutineChange('breakfastAt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.lunchAt')}</span>
                <input
                  type="time"
                  value={routine.lunchAt}
                  onChange={(event) => handleRoutineChange('lunchAt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.dinnerAt')}</span>
                <input
                  type="time"
                  value={routine.dinnerAt}
                  onChange={(event) => handleRoutineChange('dinnerAt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.sleepAt')}</span>
                <input
                  type="time"
                  value={routine.sleepAt}
                  onChange={(event) => handleRoutineChange('sleepAt', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('profile.waterGoal')}</span>
                <input
                  type="number"
                  value={routine.waterGoalMl}
                  onChange={(event) => handleRoutineChange('waterGoalMl', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={routine.remindersEnabled}
                onChange={(event) => handleRoutineChange('remindersEnabled', event.target.checked)}
              />
              {t('profile.reminders')}
            </label>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveRoutine}
                disabled={routineSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {routineSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {routineSaving ? t('profile.savingRoutine') : t('profile.saveRoutine')}
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              disabled={!isDirty || isSaving}
              className="rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-2 text-sm font-bold text-gray-700 dark:text-slate-200 disabled:opacity-50"
            >
              {t('profile.undo')}
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={!isDirty || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? t('profile.saving') : t('profile.saveChanges')}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('profile.quickStats')}</h3>
            <p className="mt-3 text-4xl font-black text-gray-900 dark:text-slate-100">{bmi ?? '--'}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">{getBmiStatus(bmi, t)}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">
              {t('profile.languageTitle')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('profile.languageSubtitle')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                  language === 'vi'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200'
                }`}
              >
                {t('profile.language.vi')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-xl px-4 py-2 text-sm font-bold border ${
                  language === 'en'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200'
                }`}
              >
                {t('profile.language.en')}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-gray-500 dark:text-slate-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('profile.changePassword')}</h3>
            </div>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder={t('profile.currentPassword')}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={t('profile.newPassword')}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('profile.confirmPassword')}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-slate-100"
            />

            <button
              type="button"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full rounded-xl bg-gray-900 dark:bg-slate-700 text-white px-4 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              {isChangingPassword ? t('profile.changingPassword') : t('profile.changePasswordBtn')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePageV2;
