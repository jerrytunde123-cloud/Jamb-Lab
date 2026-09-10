// JAMB Standard Questions Database
const quizData = {
    english: {
        name: "English Language",
        icon: "📖",
        questions: [
            {
                question: "Choose the option nearest in meaning to the word in italics: The governor's speech was characterized by circumlocution.",
                options: ["Directness", "Verbosity", "Simplicity", "Clarity"],
                correct: 1
            },
            {
                question: "Select the word that is most nearly opposite in meaning to 'Benevolent'",
                options: ["Kind", "Generous", "Malevolent", "Charitable"],
                correct: 2
            },
            {
                question: "Choose the correct option to complete the sentence: Neither the teacher nor the students ______ present.",
                options: ["was", "were", "is", "has been"],
                correct: 1
            },
            {
                question: "Identify the figure of speech: 'The wind whispered through the trees'",
                options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
                correct: 2
            },
            {
                question: "Choose the option with correct spelling:",
                options: ["Accomodation", "Accommodation", "Acommodation", "Accommodetion"],
                correct: 1
            },
            {
                question: "Select the appropriate preposition: He has been suffering ______ malaria for two weeks.",
                options: ["of", "from", "with", "by"],
                correct: 1
            },
            {
                question: "Choose the word that best completes the sentence: The ______ of the matter is that we need more time.",
                options: ["truth", "fact", "reality", "essence"],
                correct: 3
            },
            {
                question: "Identify the type of sentence: 'If I were you, I would study harder'",
                options: ["Conditional", "Declarative", "Interrogative", "Imperative"],
                correct: 0
            },
            {
                question: "Choose the correct form: The committee ______ divided in their opinions.",
                options: ["is", "are", "was", "has"],
                correct: 1
            },
            {
                question: "Select the word with the same vowel sound as 'beat':",
                options: ["Bet", "Bait", "Bit", "Seat"],
                correct: 3
            }
        ]
    },
    
    mathematics: {
        name: "Mathematics",
        icon: "📐",
        questions: [
            {
                question: "If x² + 5x - 14 = 0, find the values of x.",
                options: ["x = 2 or -7", "x = -2 or 7", "x = 1 or -14", "x = -1 or 14"],
                correct: 0
            },
            {
                question: "Find the derivative of f(x) = 3x³ - 2x² + 5x - 7",
                options: ["9x² - 4x + 5", "6x² - 4x + 5", "9x² + 4x + 5", "3x² - 2x + 5"],
                correct: 0
            },
            {
                question: "In a class of 40 students, 25 study Mathematics and 20 study Physics. If 10 study both, how many study neither?",
                options: ["5", "10", "15", "20"],
                correct: 0
            },
            {
                question: "Find the value of log₂16",
                options: ["2", "4", "8", "16"],
                correct: 1
            },
            {
                question: "The sum of the first n terms of an AP is 3n² + n. Find the first term.",
                options: ["3", "4", "5", "6"],
                correct: 1
            },
            {
                question: "If sin θ = 3/5 and θ is acute, find cos θ.",
                options: ["3/5", "4/5", "5/4", "5/3"],
                correct: 1
            },
            {
                question: "Simplify: (3x²y³)⁴",
                options: ["81x⁸y¹²", "12x⁶y⁷", "81x⁶y⁷", "12x⁸y¹²"],
                correct: 0
            },
            {
                question: "A die is rolled. What is the probability of getting an even number?",
                options: ["1/6", "1/3", "1/2", "2/3"],
                correct: 2
            },
            {
                question: "Find the inverse of the matrix [[2,1],[5,3]]",
                options: ["[[3,-1],[-5,2]]", "[[3,1],[5,2]]", "[[-3,1],[5,-2]]", "[[3,-1],[5,-2]]"],
                correct: 0
            },
            {
                question: "The mean of five numbers is 12. If four of the numbers are 8, 10, 13, and 15, find the fifth number.",
                options: ["12", "14", "16", "18"],
                correct: 1
            }
        ]
    },
    
    physics: {
        name: "Physics",
        icon: "⚡",
        questions: [
            {
                question: "A body of mass 2kg is moving with a velocity of 4 m/s. Calculate its kinetic energy.",
                options: ["8 J", "16 J", "32 J", "4 J"],
                correct: 1
            },
            {
                question: "The SI unit of electric current is:",
                options: ["Volt", "Ohm", "Ampere", "Watt"],
                correct: 2
            },
            {
                question: "Which of the following is a scalar quantity?",
                options: ["Force", "Velocity", "Acceleration", "Mass"],
                correct: 3
            },
            {
                question: "The acceleration due to gravity on Earth is approximately:",
                options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "7.8 m/s²"],
                correct: 1
            },
            {
                question: "A transformer works on the principle of:",
                options: ["Self induction", "Mutual induction", "Electrostatic induction", "Magnetic induction"],
                correct: 1
            },
            {
                question: "The speed of light in vacuum is approximately:",
                options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
                correct: 0
            },
            {
                question: "Which of these is not a fundamental quantity?",
                options: ["Length", "Mass", "Time", "Force"],
                correct: 3
            },
            {
                question: "The frequency of a wave with period 0.02s is:",
                options: ["20 Hz", "50 Hz", "0.02 Hz", "500 Hz"],
                correct: 1
            },
            {
                question: "A convex lens has a focal length of 10cm. An object is placed 15cm from the lens. The image is:",
                options: ["Real and inverted", "Virtual and erect", "Real and erect", "Virtual and inverted"],
                correct: 0
            },
            {
                question: "The energy stored in a capacitor is given by:",
                options: ["½CV²", "CV²", "½CV", "2CV²"],
                correct: 0
            }
        ]
    },
    
    chemistry: {
        name: "Chemistry",
        icon: "🧪",
        questions: [
            {
                question: "The atomic number of an element is determined by the number of:",
                options: ["Neutrons", "Protons", "Electrons", "Nucleons"],
                correct: 1
            },
            {
                question: "Which of the following is a noble gas?",
                options: ["Oxygen", "Nitrogen", "Argon", "Chlorine"],
                correct: 2
            },
            {
                question: "The pH of a neutral solution at 25°C is:",
                options: ["0", "7", "14", "1"],
                correct: 1
            },
            {
                question: "The process of converting solid directly to gas is called:",
                options: ["Evaporation", "Condensation", "Sublimation", "Deposition"],
                correct: 2
            },
            {
                question: "Which bond is formed by the transfer of electrons?",
                options: ["Covalent bond", "Ionic bond", "Metallic bond", "Hydrogen bond"],
                correct: 1
            },
            {
                question: "The chemical formula for glucose is:",
                options: ["C₆H₁₂O₆", "C₆H₆O₆", "C₁₂H₂₂O₁₁", "CH₃COOH"],
                correct: 0
            },
            {
                question: "Which of the following is an exothermic reaction?",
                options: ["Photosynthesis", "Combustion", "Melting of ice", "Evaporation"],
                correct: 1
            },
            {
                question: "The most abundant element in the Earth's crust is:",
                options: ["Iron", "Silicon", "Oxygen", "Aluminium"],
                correct: 2
            },
            {
                question: "What is the oxidation state of Mn in KMnO₄?",
                options: ["+2", "+4", "+6", "+7"],
                correct: 3
            },
            {
                question: "The rate of a chemical reaction increases with temperature because:",
                options: ["Reactants become lighter", "More collisions occur", "Products become unstable", "Catalysts are formed"],
                correct: 1
            }
        ]
    },
    
    biology: {
        name: "Biology",
        icon: "🧬",
        questions: [
            {
                question: "The powerhouse of the cell is the:",
                options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
                correct: 2
            },
            {
                question: "Which blood group is known as the universal donor?",
                options: ["A", "B", "AB", "O"],
                correct: 3
            },
            {
                question: "Photosynthesis occurs mainly in the:",
                options: ["Roots", "Stem", "Leaves", "Flowers"],
                correct: 2
            },
            {
                question: "The functional unit of the kidney is:",
                options: ["Neuron", "Nephron", "Alveolus", "Villi"],
                correct: 1
            },
            {
                question: "Which of the following is NOT a carbohydrate?",
                options: ["Glucose", "Starch", "Cellulose", "Insulin"],
                correct: 3
            },
            {
                question: "The process of cell division in somatic cells is called:",
                options: ["Meiosis", "Mitosis", "Binary fission", "Budding"],
                correct: 1
            },
            {
                question: "Which organ produces insulin?",
                options: ["Liver", "Kidney", "Pancreas", "Spleen"],
                correct: 2
            },
            {
                question: "The genetic material in living organisms is:",
                options: ["RNA", "DNA", "Protein", "Lipid"],
                correct: 1
            },
            {
                question: "Respiration that requires oxygen is called:",
                options: ["Anaerobic", "Aerobic", "Fermentation", "Glycolysis"],
                correct: 1
            },
            {
                question: "The smallest unit of life is:",
                options: ["Atom", "Molecule", "Cell", "Tissue"],
                correct: 2
            }
        ]
    }
};

// Additional subjects can be added here
// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = quizData;
      } 
