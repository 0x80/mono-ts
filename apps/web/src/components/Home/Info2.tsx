import * as React from "react";

export default function Info2() {
  return (
    <div className="flex justify-center items-center px-16 py-16 bg-white max-md:px-5">
      <div className="w-full max-w-[1015px] max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col max-md:gap-0">
          <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
            <img
              loading="lazy"
              srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/9eafbf8a184a4daf0f3378d6ac588f0a1e8f0cb50d06c0fa865bb7e8666beba9?apiKey=851057bcf5b3427b821ed90e5714ffa1&"
              className="grow w-full aspect-[1.49] max-md:mt-10 max-md:max-w-full"
            />
          </div>
          <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col self-stretch my-auto font-extrabold text-right max-md:mt-10 max-md:max-w-full">
              <div className="self-end text-xl text-emerald-400">
                PUEDES REVENDER
              </div>
              <div className="mt-3.5 text-4xl text-black max-md:max-w-full">
                No te preocupes de comprar con anticipacón
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
