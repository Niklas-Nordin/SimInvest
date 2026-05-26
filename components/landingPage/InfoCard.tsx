import {steps} from "@/lib/infoSteps";

function Card() {
  return (
<section className="flex flex-col gap-10 p-10 items-center text-center">
  <h2 className="font-bold text-3xl">Hur det fungerar</h2>

  <ol className="flex flex-col gap-6">
    {steps.map(step => (
      <li key={step.step} className="flex flex-col gap-4">
        <img src={step.icon} alt={step.title} className="w-16 h-16 mx-auto bg-space-dark rounded-full" />
        <h3 className="font-bold text-xl">{step.step + ". " + step.title}</h3>
        <p className="">{step.description}</p>
      </li>
    ))}
  </ol>
</section>

  );
}

export default Card;