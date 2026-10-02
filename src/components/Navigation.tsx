import React from 'react';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  Bus,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Grid3X3,
  BrainCircuit,
  AlertTriangle,
  ClipboardList,
  FileBarChart,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'candidates'
  | 'welcome_kit'
  | 'transport'
  | 'school'
  | 'production'
  | 'learning_curve'
  | 'polyvalence'
  | 'attrition'
  | 'alerts'
  | 'surveys'
  | 'reports';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  openAlertsCount: number;
  criticalAttritionCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  openAlertsCount,
  criticalAttritionCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard DG', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidats (M1)', icon: Users },
    { id: 'welcome_kit', label: 'Accueil J1 (M2)', icon: PackageCheck },
    { id: 'transport', label: 'Transport (M3)', icon: Bus },
    { id: 'school', label: 'École 5J (M4)', icon: GraduationCap },
    { id: 'production', label: 'Affectation (M6)', icon: Briefcase },
    { id: 'learning_curve', label: 'Learning Curve (M8/9)', icon: TrendingUp },
    { id: 'polyvalence', label: 'Polyvalence (M10)', icon: Grid3X3 },
    {
      id: 'attrition',
      label: 'Scoring IA (M12)',
      icon: BrainCircuit,
      badge: criticalAttritionCount > 0 ? `${criticalAttritionCount} critique` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    },
    {
      id: 'alerts',
      label: 'Alertes (M13)',
      icon: AlertTriangle,
      badge: openAlertsCount > 0 ? `${openAlertsCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    { id: 'surveys', label: 'Enquêtes (M5/11)', icon: ClipboardList },
    { id: 'reports', label: 'Power BI & Rapports', icon: FileBarChart },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-20 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onTabChange(item.id as ActiveTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
