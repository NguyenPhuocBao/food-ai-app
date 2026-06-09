import type { PTProgressCheckin } from '../../services/pt.service';

type MemberOption = {
  id: number;
  name: string;
};

type CheckinHistorySummary = {
  total: number;
  latest: PTProgressCheckin;
  earliest: PTProgressCheckin;
  weightDelta: number | null;
} | null;

type PTCheckinHistoryPanelProps = {
  checkins: PTProgressCheckin[];
  filterUserId: number;
  selectedMemberName?: string | null;
  summary: CheckinHistorySummary;
  members: MemberOption[];
  onFilterChange: (userId: number) => void;
};

const PTCheckinHistoryPanel = ({
  checkins,
  filterUserId,
  selectedMemberName,
  summary,
  members,
  onFilterChange,
}: PTCheckinHistoryPanelProps) => {
  return (
    <div className="rounded-[30px] border border-teal-400/25 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(17,94,89,0.94))] p-6 shadow-[0_20px_45px_rgba(20,184,166,0.16)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Lịch sử check-in</h3>
          <p className="mt-1 text-sm text-teal-100/75">
            Theo dõi tiến độ từng học viên theo dòng thời gian, không cần chỉ nhìn bản ghi mới nhất.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <select
            value={filterUserId}
            onChange={(event) => onFilterChange(Number(event.target.value))}
            className="w-full rounded-2xl border border-teal-400/20 bg-slate-900/65 px-4 py-3 text-sm text-white outline-none focus:border-teal-300"
          >
            <option value={0}>Tất cả học viên</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <span className="block text-right text-xs font-bold text-teal-100/60">
            {checkins.length} bản ghi
          </span>
        </div>
      </div>

      {summary && (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-100/60">Đối tượng</p>
            <p className="mt-1 text-sm font-black text-white">
              {selectedMemberName || 'Tất cả học viên'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Lần mới nhất</p>
            <p className="mt-1 text-sm font-black text-white">
              {summary.latest.weight ? `${summary.latest.weight} kg` : 'Chưa có cân nặng'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">So với lần đầu</p>
            <p className="mt-1 text-sm font-black text-white">
              {summary.weightDelta === null ? 'Chưa đủ dữ liệu' : `${summary.weightDelta > 0 ? '+' : ''}${summary.weightDelta} kg`}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">Mốc đầu tiên</p>
            <p className="mt-1 text-sm font-black text-white">
              {new Date(summary.earliest.recordedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {checkins.map((checkin) => (
          <div key={checkin.id} className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-black text-white">{checkin.user.name}</p>
                <p className="text-xs text-teal-100/65">{new Date(checkin.recordedAt).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-100">
                {checkin.recordedBy ? `Bởi ${checkin.recordedBy.name}` : 'Tự cập nhật'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold md:grid-cols-4">
              <div className="rounded-xl bg-white/10 px-3 py-2 text-teal-50 shadow-sm">
                <p className="text-teal-100/60">Cân nặng</p>
                <p className="mt-1 text-sm text-white">
                  {checkin.weight ? `${checkin.weight} kg` : 'Chưa có'}
                </p>
              </div>
              <div className="rounded-xl bg-cyan-400/10 px-3 py-2 text-teal-50 shadow-sm">
                <p className="text-cyan-200">Chiều cao</p>
                <p className="mt-1 text-sm text-white">
                  {checkin.user.profile?.height ? `${checkin.user.profile.height} cm` : 'Chưa có'}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-400/10 px-3 py-2 text-teal-50 shadow-sm">
                <p className="text-emerald-200">% mỡ</p>
                <p className="mt-1 text-sm text-white">
                  {checkin.bodyFat ? `${checkin.bodyFat}%` : 'Chưa có'}
                </p>
              </div>
              <div className="rounded-xl bg-sky-400/10 px-3 py-2 text-teal-50 shadow-sm">
                <p className="text-sky-200">Vòng eo</p>
                <p className="mt-1 text-sm text-white">
                  {checkin.waist ? `${checkin.waist} cm` : 'Chưa có'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-teal-50/85">
              {checkin.note || 'Không có ghi chú'}
            </p>
          </div>
        ))}
        {!checkins.length && (
          <div className="rounded-2xl border border-dashed border-teal-300/20 p-5 text-sm text-teal-100/70">
            {filterUserId ? 'Học viên này chưa có check-in nào.' : 'Chưa có check-in nào.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PTCheckinHistoryPanel;
