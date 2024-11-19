import algoliasearch from "algoliasearch/lite";
import { InstantSearch, Configure } from "react-instantsearch";
import CustomPagination from "./Pagination";
import CustomSearchBox from "./SearchBox";

import type { ReactNode } from "react";

export default function SearchBoxAlgolia({
  children,
  index,
}: {
  children: ReactNode;
  index: string;
}) {
  const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY || ""
  );

  return (
    <InstantSearch searchClient={searchClient} indexName={index}>
      <Configure hitsPerPage={10} />
      <CustomSearchBox />

      {children}

      <CustomPagination />
    </InstantSearch>
  );
}
