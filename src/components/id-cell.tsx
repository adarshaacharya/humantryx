import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

/**
 *
 * TODO: Make smart navigation routing to detail page of each?
 */

type IdCellProps = {
  id: string;
  truncate?: boolean;
};

export const getShortId = (longId: string, truncate = true) => {
  if (!truncate) {
    return longId;
  }

  if (longId.includes("_")) {
    const [prefix, ...rest] = longId.split("_");
    const suffix = longId.slice(-4);
    return `${prefix}_${rest.join("_").slice(0, 3)}...${suffix}`;
  } else if (longId.length > 10) {
    return `...${longId.slice(-4)}`;
  }

  return longId;
};

export function IdCell({ id, truncate = true }: IdCellProps) {
  const [_copiedText, copy] = useCopyToClipboard();

  const doCopy = () => {
    copy(id)
      .then(() => {
        toast.success("Text copied to clipboard!");
      })
      .catch(() => {
        toast.error("Unable to copy to clipboard.");
      });
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
        <div
          className={cn(
            "text-primary flex cursor-pointer items-center gap-2 font-medium underline",
          )}
          onClick={() => doCopy()}
        >
          <p>{getShortId(id, truncate)}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{id}</p>
      </TooltipContent>
    </Tooltip>
  );
}
