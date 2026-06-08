import { steps } from "@/lib/data";

function Card() {
  return (
    <section className="w-full p-10 lg:p-10">
      <h2 className="font-bold text-3xl md:text-4xl text-center mb-16 lg:text-left">
        Hur det fungerar
      </h2>

      <ol className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative">
        {steps.map((step, index) => (
          <li key={step.step} className="flex flex-col items-center text-center lg:items-start lg:text-left relative group">
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[4rem] right-[-2rem] h-[2px] bg-gradient-to-r from-space-dark to-space-light z-0" />
            )}

            <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-space-light bg-space-dark relative z-10 mb-6">
              <img src={step.icon} alt={step.title} className="w-8 h-8 object-contain" />
              
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-space-light border-2 border-space-dark text-[10px] font-bold text-space-dark">
                {step.step}
              </span>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-bold text-xl text-white tracking-tight">
                {step.title}
              </h3>
              <p className=" text-sm leading-relaxed">
                {step.description}
              </p>
            </div>

          </li>
        ))}
      </ol>
    </section>
  );
}

export default Card;