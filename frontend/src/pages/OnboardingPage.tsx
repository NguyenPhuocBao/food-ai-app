import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, SkipForward } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/auth.service';
import { getPersonalization, updateRoutine } from '../services/health.service';

type GoalType = 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTENANCE' | 'MUSCLE_GAIN';
type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

const GOAL_OPTIONS: Array<{ value: GoalType; label: string }> = [
  { value: 'WEIGHT_LOSS', label: 'Giam can' },
  { value: 'MAINTENANCE', label: 'Duy tri' },
  { value: 'WEIGHT_GAIN', label: 'Tang can' },
  { value: 'MUSCLE_GAIN', label: 'Tang co' },
];

const ACTIVITY_OPTIONS: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'SEDENTARY', label: 'It van dong' },
  { value: 'LIGHT', label: 'Van dong nhe' },
  { value: 'MODERATE', label: 'Van dong vua' },
  { value: 'ACTIVE', label: 'Van dong cao' },
  { value: 'VERY_ACTIVE', label: 'Van dong rat cao' },
];

const defaultCaloriesByGoal = (goalType: GoalType) => {
  if (goalType === 'WEIGHT_LOSS') return 1700;
  if (goalType === 'WEIGHT_GAIN') return 2600;
  if (goalType === 'MUSCLE_GAIN') return 2400;
  return 2100;
};

const parseCommaList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toOptionalNumber = (raw: string) => {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const OnboardingPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [goalType, setGoalType] = useState<GoalType>('MAINTENANCE');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATE');
  const [targetCalories, setTargetCalories] = useState('2100');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [dietaryPrefText, setDietaryPrefText] = useState('');
  const [waterGoalMl, setWaterGoalMl] = useState('2200');
  const [breakfastAt, setBreakfastAt] = useState('07:30');
  const [lunchAt, setLunchAt] = useState('12:30');
  const [dinnerAt, setDinnerAt] = useState('19:00');
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    if (!user) return;

    const activeGoal = user.goals?.find((goal) => goal.isActive) || user.goals?.[0];
    const profile = user.profile;
    if (activeGoal?.goalType) setGoalType(activeGoal.goalType);
    if (profile?.activityLevel) setActivityLevel(profile.activityLevel);
    if (activeGoal?.targetCalories || profile?.targetCalories) {
      setTargetCalories(String(activeGoal?.targetCalories || profile?.targetCalories));
    }
    if (profile?.height) setHeight(String(profile.height));
    if (profile?.weight) setWeight(String(profile.weight));
    if (profile?.allergies?.length) setAllergiesText(profile.allergies.join(', '));
    if (profile?.dietaryPref?.length) setDietaryPrefText(profile.dietaryPref.join(', '));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    getPersonalization()
      .then((data) => {
        if (!mounted) return;
        const routine = data?.routine;
        if (!routine) return;
        setWaterGoalMl(String(routine.waterGoalMl || 2200));
        setBreakfastAt(routine.breakfastAt || '07:30');
        setLunchAt(routine.lunchAt || '12:30');
        setDinnerAt(routine.dinnerAt || '19:00');
        setRemindersEnabled(routine.remindersEnabled !== false);
      })
      .finally(() => {
        if (mounted) setLoadingRoutine(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const goalHint = useMemo(() => {
    if (goalType === 'WEIGHT_LOSS') return 'Uu tien mon it dau mo, it tinh bot nhanh, nhieu chat xo.';
    if (goalType === 'WEIGHT_GAIN') return 'Uu tien tang tong calo va dam bao bua phu.';
    if (goalType === 'MUSCLE_GAIN') return 'Tang protein theo bua, theo doi calo va gio tap.';
    return 'Duy tri can bang nang luong va macro on dinh.';
  }, [goalType]);

  const handleApplyGoalTemplate = () => {
    setTargetCalories(String(defaultCaloriesByGoal(goalType)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        goalType,
        activityLevel,
        targetCalories: toOptionalNumber(targetCalories),
        height: toOptionalNumber(height),
        weight: toOptionalNumber(weight),
        allergies: parseCommaList(allergiesText),
        dietaryPref: parseCommaList(dietaryPrefText),
      });

      await updateRoutine({
        breakfastAt,
        lunchAt,
        dinnerAt,
        waterGoalMl: toOptionalNumber(waterGoalMl),
        remindersEnabled,
      });

      await refreshUser();
      toast.success('Da luu thong tin onboarding');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Khong th? luu onboarding');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Onboarding</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-slate-100 mt-2">Thiet lap nhanh cho ban</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            2 phut de he thong gui ? meal plan va reminder phu hop hon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Muc tieu</label>
              <select
                value={goalType}
                onChange={(event) => setGoalType(event.target.value as GoalType)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              >
                {GOAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">{goalHint}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Muc van dong</label>
              <select
                value={activityLevel}
                onChange={(event) => setActivityLevel(event.target.value as ActivityLevel)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Target calories</label>
              <input
                value={targetCalories}
                onChange={(event) => setTargetCalories(event.target.value)}
                placeholder="2100"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyGoalTemplate}
              className="h-10 px-4 rounded-xl border border-emerald-300 text-emerald-700 dark:text-emerald-300 text-sm font-semibold"
            >
              Ap dung gui ?
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Chieu cao (cm)</label>
              <input
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder="170"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Can nang (kg)</label>
              <input
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="65"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Di ung (phan tach boi dau phay)</label>
              <input
                value={allergiesText}
                onChange={(event) => setAllergiesText(event.target.value)}
                placeholder="hai san, sua"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">Che do an uu tien</label>
              <input
                value={dietaryPrefText}
                onChange={(event) => setDietaryPrefText(event.target.value)}
                placeholder="an chay, it tinh bot"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 p-4 space-y-4">
            <h2 className="text-sm font-bold text-gray-800 dark:text-slate-100">Routine nhac nho</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500">Breakfast</label>
                <input
                  type="time"
                  value={breakfastAt}
                  onChange={(event) => setBreakfastAt(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Lunch</label>
                <input
                  type="time"
                  value={lunchAt}
                  onChange={(event) => setLunchAt(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Dinner</label>
                <input
                  type="time"
                  value={dinnerAt}
                  onChange={(event) => setDinnerAt(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Water goal (ml)</label>
                <input
                  value={waterGoalMl}
                  onChange={(event) => setWaterGoalMl(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(event) => setRemindersEnabled(event.target.checked)}
              />
              Bat nhac nho bo bua va uong nuoc
            </label>
            {loadingRoutine && <p className="text-xs text-gray-500">?ang tai routine hien tai...</p>}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 dark:text-slate-300 text-sm font-semibold"
            >
              <SkipForward size={16} />
              De sau
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-semibold"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? '?ang luu...' : 'Hoan tat onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
