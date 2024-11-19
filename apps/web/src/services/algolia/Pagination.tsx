import LoadingButton from "@/components/Materials/LoadingButton";
import type { MouseEvent } from "react";
import { usePagination, type UsePaginationProps } from "react-instantsearch";

import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  menu: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    listStyle: "none",
    padding: 0,
    flexDirection: "row",
  },
  item: {
    display: "inline-block",
    padding: "8px",
  },
}));

export default function CustomPagination(props: UsePaginationProps) {
  const { currentRefinement, isFirstPage, isLastPage, refine, createURL } =
    usePagination(props);
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const { classes } = useStyles();

  return (
    <div className={classes.menu}>
      <PaginationItem
        isDisabled={isFirstPage}
        href={createURL(previousPageIndex)}
        onClickFunc={() => refine(previousPageIndex)}
        className={classes.item}
        label={"Anterior"}
      />
      <PaginationItem
        key={currentRefinement}
        isDisabled={false}
        label={(currentRefinement + 1).toString()}
        href={createURL(currentRefinement)}
        onClickFunc={() => refine(currentRefinement)}
        className={classes.item}
      />
      <PaginationItem
        isDisabled={isLastPage}
        href={createURL(nextPageIndex)}
        onClickFunc={() => refine(nextPageIndex)}
        className={classes.item}
        label={"Siguiente"}
      />
    </div>
  );
}

function PaginationItem({
  isDisabled,
  href,
  onClickFunc,
  label = "",
  className,
}: {
  isDisabled: boolean;
  href: string;
  onClickFunc: (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  label: string;
  className: string;
}) {
  if (isDisabled) {
    return (
      <div className={className}>
        <LoadingButton variant="contained" disabled>
          <span>{label}</span>
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className={className}>
      <LoadingButton
        variant="contained"
        href={href}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }

          event.preventDefault();

          onClickFunc(event);
        }}
      >
        <span>{label}</span>
      </LoadingButton>
    </div>
  );
}

function isModifierClick(
  event: MouseEvent<
    HTMLButtonElement | HTMLAnchorElement,
    globalThis.MouseEvent
  >
) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}
