import * as React from "react";

export default function ContactProducer() {
  return (
    <div className="flex justify-center items-center px-16 py-20 bg-blue-400 max-md:px-5">
      <div className="flex justify-center items-center px-16 py-14 mt-5 w-full bg-white max-w-[1016px] rounded-[32px] max-md:px-5 max-md:max-w-full">
        <div className="flex flex-col max-w-full w-[514px]">
          <div className="text-5xl font-extrabold text-center text-black max-md:max-w-full max-md:text-4xl">
            ¿Buscas promover tu negocio?
          </div>
          <div className="justify-center self-center px-11 py-6 mt-9 text-xl font-bold text-white whitespace-nowrap bg-emerald-400 rounded-3xl max-md:px-5">
            <a href="https://calendar.app.google/VZ588xZCz9b8KPk57">
              Contáctanos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
