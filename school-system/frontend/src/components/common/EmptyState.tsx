import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import s from "./EmptyState.module.css";

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className={s.wrap}>
    <div className={s.icon}>{icon ?? <Inbox size={22} />}</div>
    <h3 className={s.title}>{title}</h3>
    {description && <p className={s.desc}>{description}</p>}
    {action && <div className={s.action}>{action}</div>}
  </div>
);
