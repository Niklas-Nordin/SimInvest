function AboutUsPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="px-10 py-20 bg-gradient-to-br from-space-dark via-space-teal to-space-dark text-white text-center flex flex-col gap-10 items-center w-full text-xl">
        <h1 className="text-5xl font-bold">Om SimInvest</h1>
        <p className="max-w-300 px-10">Ekonomi, sparande och investeringar är något som berör oss alla i vardagen, men att ta första steget ut på kryptomarknaden kan kännas både komplicerat och riskfyllt. SimInvest skapades som lösningen på detta, en interaktiv ekonomisimulator där du kan lära dig att navigera på kryptomarknaden, analysera trender och testa dina investeringsstrategier med fiktiva pengar, helt utan ekonomisk risk.</p>

        <p className="max-w-300 px-10">Vårt mål är att sänka tröskeln till finansvärlden. Genom att kombinera marknadsdata i realtid med en helt riskfri miljö ger vi dig verktygen och självförtroendet som behövs för att förstå hur digitala tillgångar fungerar i praktiken.</p>
      </div>

      <div className="flex px-10 py-20 gap-10 max-w-300">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg lg:text-2xl">En komplett handelsupplevelse utan risk</h2>
          <p>Plattformen speglar den verkliga finansvärlden genom att hämta levande marknadsdata. Som användare får du ett fiktivt startkapital och full tillgång till en personlig dashboard, interaktiva prisdiagram och en detaljerad transaktionshistorik. Allt är designat för att ge dig en så realistisk och lärorik upplevelse som möjligt, där du i din egen takt kan spåra vinster, förluster och portföljutveckling.</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-lg lg:text-2xl">Visionen framåt</h2>
          <p>SimInvest är under ständig utveckling för att bli den ultimata utbildningsplattformen för digitala tillgångar. Framöver planerar vi att expandera plattformen med ett ännu bredare utbud av kryptovalutor, djupgående informationsguider för varje specifik tillgång, samt smarta verktyg som automatiskt analyserar din portföljs utveckling över längre tidsperioder.</p>
        </div>
      </div>
        <div className="w-full h-[1] max-w-300 px-10 mb-20">
          <div className="w-full h-[1] bg-space-dark max-w-300"></div>
        </div>

      <div className="flex flex-col items-center gap-6 px-10 mb-20">
        <h2 className="font-bold text-lg lg:text-2xl">Vilka är vi?</h2>
        <p className="max-w-300 px-10 text-center">SimInvest är grundat och utvecklat av Niklas Nordin och Fares Elloumi. Med ett gemensamt intresse för modern webbdesign, finans och användarvänliga digitala produkter, har vi byggt den här plattformen från grunden för att ge dig bästa möjliga upplevelse.</p>
      </div>
    </div>
  );
}

export default AboutUsPage;