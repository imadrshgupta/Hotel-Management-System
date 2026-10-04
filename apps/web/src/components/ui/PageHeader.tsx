import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = "",
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 sm:gap-3 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};
