import Tooltip from "./Tooltip";
import { CircleQuestionMark } from "lucide-react";


interface Props {
  title: string | undefined;
  tooltip?: string | undefined;
  children: React.ReactNode;
  className?: string;
}

function Panel({ title, tooltip, children, className = "" }: Props) {
  return (
    <div className={`panel ${className}`}>
      <h2>
        {title}
        {tooltip && (
          <Tooltip text={tooltip}>
            <CircleQuestionMark />
          </Tooltip>
        )}
      </h2>
      <div className="panelScroll">
        {children}
      </div>
    </div>
  )
}

export default Panel;