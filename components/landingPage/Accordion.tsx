import { faqItems } from "@/lib/data";
import { useState } from "react";

function Accordion() {
    const [openId, setOpenId] = useState<number[]>([]);

    const toggleAccordion = (id: number) => {
        setOpenId(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6">Vanliga frågor</h2>
            <ul className="space-y-4">
                {faqItems.map((item) => {
                    const isOpen = openId.includes(item.id);
                    
                    return (
                        <li key={item.id} className="border-b border-gray-200 pb-4">
                            <button 
                                onClick={() => toggleAccordion(item.id)} 
                                className="w-full flex justify-between items-center py-3 text-left font-medium text-lg focus:outline-none"
                            >
                                <span>{item.title}</span>
                                <span className="text-xl font-mono">{isOpen ? "−" : "+"}</span>
                            </button>
                            
                            <div 
                                className={`grid transition-all duration-300 ease-in-out ${
                                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="pt-2 pb-3 leading-relaxed">
                                        {item.content}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Accordion;