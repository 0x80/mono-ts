import * as React from "react";

export default function LandingTopBar() {
  return (
    <div className="flex justify-center items-center px-16 py-8 text-xl font-bold whitespace-nowrap bg-white max-md:px-5">
      <div className="flex gap-5 justify-between w-full max-w-[1020px] max-md:flex-wrap max-md:max-w-full">
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/0644ccc921a379f3a51c25960480fe50db3d772924a90bf24b3d16c83ac028d7?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
          className="shrink-0 my-auto w-40 max-w-full aspect-[3.03]"
        />
      </div>
    </div>
  );
}
