import React from "react";
import List from "@mui/material/List";
import StadiumIcon from "@mui/icons-material/Stadium";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import BusinessIcon from "@mui/icons-material/Business";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SideBarItem from "./SideBarItem";
import BookRoundedIcon from "@mui/icons-material/BookRounded";
export default function AdminSideBarOptions() {
  const selectedIndex = -1;
  return (
    <div>
      <List>
        <SideBarItem
          text={"Eventos"}
          route={"/admin/events"}
          icon={<StadiumIcon />}
          index={0}
          selectedIndex={selectedIndex}
        />
        <SideBarItem
          text={"Productoras"}
          route={"/admin/producers"}
          icon={<BusinessIcon />}
          index={1}
          selectedIndex={selectedIndex}
        />

        <SideBarItem
          text={"Ordenes de reventa"}
          route={"/admin/resellOrders"}
          icon={<CurrencyExchangeIcon />}
          index={2}
          selectedIndex={selectedIndex}
        />

        <SideBarItem
          text={"Blogs"}
          route={"/admin/blogs"}
          icon={<BookRoundedIcon />}
          index={3}
          selectedIndex={selectedIndex}
        />

        <SideBarItem
          text={"Simulador de costos"}
          route={"/costSimulator"}
          icon={<PriceChangeIcon />}
          index={4}
          selectedIndex={selectedIndex}
        />
      </List>
    </div>
  );
}
