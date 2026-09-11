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
            },
            {
                question: "Choose the option that is nearest in meaning to the word in italics: The chairman's remarks were quite cryptic.",
                options: ["Clear", "Ambiguous", "Lengthy", "Harsh"],
                correct: 1
            },
            {
                question: "Choose the option opposite in meaning to the word in italics: The soldier was commended for his bravery.",
                options: ["Rewarded", "Punished", "Cowardice", "Praised"],
                correct: 2
            },
            {
                question: "Choose the option that best completes the sentence: The principal, together with the teachers, ______ arrived.",
                options: ["have", "has", "are", "were"],
                correct: 1
            },
            {
                question: "Choose the option that best completes the sentence: Hardly had he sat down ______ the bell rang.",
                options: ["than", "when", "then", "that"],
                correct: 1
            },
            {
                question: "Choose the option nearest in meaning to the idiom: The manager decided to let the cat out of the bag.",
                options: ["Release a cat", "Reveal a secret", "Cause trouble", "Create confusion"],
                correct: 1
            },
            {
                question: "Choose the word that has the same consonant sound as the first sound in 'church':",
                options: ["School", "Chemistry", "Chair", "Chauffeur"],
                correct: 2
            },
            {
                question: "Choose the option that best completes the sentence: If I ______ you, I would accept the offer.",
                options: ["am", "was", "were", "be"],
                correct: 2
            },
            {
                question: "From the options, choose the word that is correctly spelt:",
                options: ["Maintainance", "Maintenance", "Maintenence", "Maintanance"],
                correct: 1
            },
            {
                question: "Choose the word that has a different vowel sound:",
                options: ["Beat", "Seat", "Bit", "Meat"],
                correct: 2
            },
            {
                question: "Choose the option that best completes the sentence: The new policy will take effect ______ January 1st.",
                options: ["in", "on", "at", "from"],
                correct: 1
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
            },
            {
                question: "Convert 234₅ to base 10.",
                options: ["69", "59", "79", "49"],
                correct: 0
            },
            {
                question: "Simplify: (2√3 - √2)(2√3 + √2)",
                options: ["10", "14", "12", "8"],
                correct: 0
            },
            {
                question: "If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, find log₁₀12.",
                options: ["1.0791", "1.0792", "1.0781", "1.0801"],
                correct: 0
            },
            {
                question: "Find the remainder when x³ - 2x² + 3x - 4 is divided by (x - 2).",
                options: ["2", "4", "6", "8"],
                correct: 0
            },
            {
                question: "The 5th term of a GP is 48 and the 8th term is 384. Find the common ratio.",
                options: ["2", "3", "4", "6"],
                correct: 0
            },
            {
                question: "If α and β are roots of 2x² - 5x + 3 = 0, find α + β.",
                options: ["5/2", "3/2", "-5/2", "2/5"],
                correct: 0
            },
            {
                question: "Evaluate the determinant: |3 2; 5 4|",
                options: ["2", "-2", "22", "-22"],
                correct: 0
            },
            {
                question: "Evaluate: ∫₀² (3x² + 2x) dx",
                options: ["12", "10", "14", "16"],
                correct: 0
            },
            {
                question: "A fair die is thrown twice. What is the probability that the sum is 7?",
                options: ["1/6", "1/9", "1/12", "5/36"],
                correct: 0
            },
            {
                question: "Find the standard deviation of 2, 4, 6, 8, 10.",
                options: ["2√2", "4", "2", "√10"],
                correct: 0
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
            },
            {
                question: "A body of mass 5kg moving at 4 m/s collides with a stationary body of mass 3kg. If they move together after collision, find their common velocity.",
                options: ["2.5 m/s", "2.0 m/s", "3.0 m/s", "1.5 m/s"],
                correct: 0
            },
            {
                question: "A wire of resistance 10Ω is stretched to twice its original length. Find its new resistance.",
                options: ["40Ω", "20Ω", "5Ω", "80Ω"],
                correct: 0
            },
            {
                question: "Calculate the work done when a force of 20N moves a body through a distance of 5m at 60° to the horizontal.",
                options: ["50 J", "100 J", "25 J", "75 J"],
                correct: 0
            },
            {
                question: "A gas at 27°C has a volume of 300cm³. Find its volume at 127°C at constant pressure.",
                options: ["400 cm³", "350 cm³", "450 cm³", "500 cm³"],
                correct: 0
            },
            {
                question: "The half-life of a radioactive substance is 5 days. What fraction remains after 20 days?",
                options: ["1/16", "1/8", "1/4", "1/32"],
                correct: 0
            },
            {
                question: "Calculate the energy stored in a capacitor of 5μF charged to 100V.",
                options: ["0.025 J", "0.05 J", "0.01 J", "0.1 J"],
                correct: 0
            },
            {
                question: "A transformer has 500 turns in the primary and 50 turns in the secondary. If the primary voltage is 240V, find the secondary voltage.",
                options: ["24 V", "48 V", "12 V", "2400 V"],
                correct: 0
            },
            {
                question: "Find the resultant of two forces 6N and 8N acting at right angles to each other.",
                options: ["10 N", "14 N", "2 N", "48 N"],
                correct: 0
            },
            {
                question: "A car accelerates uniformly from rest to 20 m/s in 10 seconds. Find the distance covered.",
                options: ["100 m", "200 m", "50 m", "150 m"],
                correct: 0
            },
            {
                question: "Calculate the quantity of heat required to melt 0.5kg of ice at 0°C. (L = 336,000 J/kg)",
                options: ["168,000 J", "336,000 J", "84,000 J", "672,000 J"],
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
            },
            {
                question: "Calculate the number of moles in 22g of CO₂. (C = 12, O = 16)",
                options: ["0.5 mol", "1 mol", "2 mol", "4 mol"],
                correct: 0
            },
            {
                question: "What volume of 0.5M H₂SO₄ is required to neutralize 25cm³ of 0.2M NaOH?",
                options: ["5 cm³", "10 cm³", "2.5 cm³", "25 cm³"],
                correct: 0
            },
            {
                question: "Which of the following will undergo hydrolysis to give an acidic solution?",
                options: ["NH₄Cl", "NaCl", "CH₃COONa", "Na₂CO₃"],
                correct: 0
            },
            {
                question: "Calculate the mass of silver deposited when 0.5F of electricity is passed through AgNO₃ solution. (Ag = 108)",
                options: ["54 g", "108 g", "27 g", "216 g"],
                correct: 0
            },
            {
                question: "Which of the following is the correct electronic configuration of Fe²⁺? (Fe = 26)",
                options: ["1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶", "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁴ 4s²", "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁵ 4s¹", "1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁸"],
                correct: 0
            },
            {
                question: "Calculate the pH of 0.01M HCl solution.",
                options: ["2", "1", "3", "12"],
                correct: 0
            },
            {
                question: "The IUPAC name of CH₃CH(CH₃)CH₂CH₃ is:",
                options: ["2-methylbutane", "3-methylbutane", "2-methylpropane", "pentane"],
                correct: 0
            },
            {
                question: "Which reagent will distinguish between an aldehyde and a ketone?",
                options: ["Fehling's solution", "NaOH solution", "HCl solution", "Water"],
                correct: 0
            },
            {
                question: "What is the percentage by mass of nitrogen in NH₄NO₃? (N = 14, H = 1, O = 16)",
                options: ["35%", "28%", "17.5%", "14%"],
                correct: 0
            },
            {
                question: "Which of the following gases will diffuse fastest?",
                options: ["H₂", "O₂", "CO₂", "N₂"],
                correct: 0
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
                question: "Respiration that requires oxygen is called:",options: ["Anaerobic", "Aerobic", "Fermentation", "Glycolysis"],
                correct: 1
            },
            {
                question: "The smallest unit of life is:",
                options: ["Atom", "Molecule", "Cell", "Tissue"],
                correct: 2
            },
            {
                question: "In a cross between a heterozygous tall plant (Tt) and a short plant (tt), what is the phenotypic ratio of the offspring?",
                options: ["1 tall : 1 short", "3 tall : 1 short", "All tall", "All short"],
                correct: 0
            },
            {
                question: "The sequence of events in protein synthesis is:",
                options: ["Transcription → Translation", "Translation → Transcription", "Replication → Transcription", "Translation → Replication"],
                correct: 0
            },
            {
                question: "In a food chain, energy transfer from one trophic level to the next is approximately:",
                options: ["10%", "50%", "90%", "100%"],
                correct: 0
            },
            {
                question: "The process by which water moves from a region of higher concentration to lower concentration through a semi-permeable membrane is:",
                options: ["Osmosis", "Diffusion", "Active transport", "Plasmolysis"],
                correct: 0
            },
            {
                question: "If a man with blood group AB marries a woman with blood group O, what blood groups can their children have?",
                options: ["A and B", "AB and O", "Only AB", "Only O"],
                correct: 0
            },
            {
                question: "The enzyme that catalyzes the breakdown of starch to maltose is:",
                options: ["Amylase", "Maltase", "Lipase", "Protease"],
                correct: 0
            },
            {
                question: "Which of the following structures is responsible for the production of pollen grains?",
                options: ["Anther", "Ovary", "Stigma", "Style"],
                correct: 0
            },
            {
                question: "The correct sequence of stages in mitosis is:",
                options: ["Prophase → Metaphase → Anaphase → Telophase", "Metaphase → Prophase → Anaphase → Telophase", "Anaphase → Metaphase → Prophase → Telophase", "Telophase → Anaphase → Metaphase → Prophase"],
                correct: 0
            },
            {
                question: "The part of the brain responsible for regulating body temperature and hunger is:",
                options: ["Hypothalamus", "Cerebrum", "Cerebellum", "Medulla oblongata"],
                correct: 0
            },
            {
                question: "In an ecosystem, the primary consumers are:",
                options: ["Herbivores", "Carnivores", "Omnivores", "Decomposers"],
                correct: 0
            }
        ]
    },

    government: {
        name: "Government",
        icon: "🏛️",
        questions: [
            {
                question: "The principle that the powers of government should be divided among the three arms is called:",
                options: ["Separation of powers", "Federalism", "Rule of law", "Sovereignty"],
                correct: 0
            },
            {
                question: "In a federal system, residual powers are exercised by:",
                options: ["State governments", "Federal government", "Local governments", "Both federal and state"],
                correct: 0
            },
            {
                question: "The concept of 'rule of law' was propounded by:",
                options: ["A.V. Dicey", "John Locke", "Thomas Hobbes", "Jean Bodin"],
                correct: 0
            },
            {
                question: "The process by which a bill becomes law after presidential assent is called:",
                options: ["Legislation", "Adjudication", "Execution", "Delegation"],
                correct: 0
            },
            {
                question: "A constitution that can be amended by a simple majority in parliament is:",
                options: ["Flexible constitution", "Rigid constitution", "Written constitution", "Unwritten constitution"],
                correct: 0
            },
            {
                question: "The doctrine that the state should not interfere in the economic activities of citizens is:",
                options: ["Laissez-faire", "Socialism", "Communism", "Welfarism"],
                correct: 0
            },
            {
                question: "The upper legislative chamber in Nigeria is called:",
                options: ["Senate", "House of Representatives", "National Assembly", "Council of State"],
                correct: 0
            },
            {
                question: "The type of government in which the king or queen is the ceremonial head of state is:",
                options: ["Constitutional monarchy", "Absolute monarchy", "Republic", "Oligarchy"],
                correct: 0
            },
            {
                question: "The process of redrawing constituency boundaries is called:",
                options: ["Delimitation", "Gerrymandering", "Franchise", "Registration"],
                correct: 0
            },
            {
                question: "The principle of collective responsibility applies to:",
                options: ["Cabinet ministers", "Judges", "Civil servants", "Members of parliament"],
                correct: 0
            },
            {
                question: "The type of government in which the people rule directly is:",
                options: ["Direct democracy", "Representative democracy", "Oligarchy", "Autocracy"],
                correct: 0
            },
            {
                question: "A political system in which power is concentrated in one person is:",
                options: ["Dictatorship", "Democracy", "Federalism", "Republic"],
                correct: 0
            },
            {
                question: "The body responsible for conducting elections in Nigeria is:",
                options: ["INEC", "NECO", "WAEC", "JAMB"],
                correct: 0
            },
            {
                question: "The concept of 'checks and balances' is designed to:",
                options: ["Prevent tyranny", "Increase executive power", "Reduce judicial power", "Strengthen the legislature only"],
                correct: 0
            },
            {
                question: "The type of franchise where only property owners can vote is:",
                options: ["Restricted franchise", "Universal adult suffrage", "Secret ballot", "Open ballot"],
                correct: 0
            },
            {
                question: "The head of the civil service in Nigeria is:",
                options: ["Head of Service", "President", "Senate President", "Chief Justice"],
                correct: 0
            },
            {
                question: "A constitution that is contained in a single document is:",
                options: ["Written constitution", "Unwritten constitution", "Flexible constitution", "Rigid constitution"],
                correct: 0
            },
            {
                question: "The principle that the judiciary should be free from interference is:",
                options: ["Judicial independence", "Rule of law", "Separation of powers", "Due process"],
                correct: 0
            },
            {
                question: "The process by which citizens vote to remove an elected official is:",
                options: ["Recall", "Referendum", "Plebiscite", "Impeachment"],
                correct: 0
            },
            {
                question: "The lower legislative chamber in Nigeria is called:",
                options: ["House of Representatives", "Senate", "National Assembly", "Council of State"],
                correct: 0
            }
        ]
    },

    economics: {
        name: "Economics",
        icon: "📊",
        questions: [
            {
                question: "If the price of a commodity increases from ₦10 to ₦12 and quantity demanded falls from 100 to 80 units, calculate the price elasticity of demand.",
                options: ["1.0", "0.5", "2.0", "1.5"],
                correct: 0
            },
            {
                question: "The point where demand and supply curves intersect is called:",
                options: ["Equilibrium point", "Break-even point", "Maximum point", "Minimum point"],
                correct: 0
            },
            {
                question: "If the marginal propensity to consume is 0.8, the multiplier is:",
                options: ["5", "4", "2", "8"],
                correct: 0
            },
            {
                question: "A situation where inflation coexists with unemployment is called:",
                options: ["Stagflation", "Deflation", "Disinflation", "Hyperinflation"],
                correct: 0
            },
            {
                question: "The relationship between price and quantity supplied is:",
                options: ["Direct", "Inverse", "Constant", "Undefined"],
                correct: 0
            },
            {
                question: "Calculate the GDP if consumption is ₦500m, investment is ₦200m, government spending is ₦300m, and net exports is ₦50m.",
                options: ["₦1,050m", "₦950m", "₦1,000m", "₦1,100m"],
                correct: 0
            },
            {
                question: "The type of unemployment caused by technological changes is:",
                options: ["Structural unemployment", "Frictional unemployment", "Cyclical unemployment", "Seasonal unemployment"],
                correct: 0
            },
            {
                question: "A tax that takes a larger proportion of income from low-income earners is:",
                options: ["Regressive tax", "Progressive tax", "Proportional tax", "Direct tax"],
                correct: 0
            },
            {
                question: "The type of market where there is only one buyer is:",
                options: ["Monopsony", "Monopoly", "Oligopoly", "Perfect competition"],
                correct: 0
            },
            {
                question: "A movement along the demand curve is caused by a change in:",
                options: ["Price of the commodity", "Income", "Taste", "Population"],
                correct: 0
            },
            {
                question: "The Central Bank's tool for controlling money supply by changing the interest rate is:",
                options: ["Monetary policy", "Fiscal policy", "Income policy", "Trade policy"],
                correct: 0
            },
            {
                question: "The law of diminishing returns applies in the:",
                options: ["Short run", "Long run", "Very long run", "Market period"],
                correct: 0
            },
            {
                question: "If income increases from ₦1,000 to ₦1,200 and consumption increases from ₦800 to ₦960, calculate the MPC.",
                options: ["0.8", "0.6", "0.75", "0.9"],
                correct: 0
            },
            {
                question: "The balance of payments account that records trade in goods is:",
                options: ["Current account", "Capital account", "Financial account", "Reserve account"],
                correct: 0
            },
            {
                question: "The concept that unlimited wants compete for limited resources is:",
                options: ["Scarcity", "Choice", "Opportunity cost", "Scale of preference"],
                correct: 0
            },
            {
                question: "A situation where a country's imports exceed its exports is:",
                options: ["Trade deficit", "Trade surplus", "Balance of trade", "Terms of trade"],
                correct: 0
            },
            {
                question: "The type of market structure with many sellers and differentiated products is:",
                options: ["Monopolistic competition", "Perfect competition", "Oligopoly", "Monopoly"],
                correct: 0
            },
            {
                question: "The main objective of the Economic Community of West African States (ECOWAS) is:",
                options: ["Economic integration", "Military alliance", "Cultural exchange", "Political union"],
                correct: 0
            },
            {
                question: "The formula for calculating national income by expenditure approach is:",
                options: ["C + I + G + (X - M)", "C + I + G", "C + I + G - T", "C + S + T"],
                correct: 0
            },
            {
                question: "A good whose demand increases when the price of another good increases is:",
                options: ["Substitute good", "Complementary good", "Inferior good", "Normal good"],
                correct: 0
            }
        ]
    },

    literature: {
        name: "Literature in English",
        icon: "📚",
        questions: [
            {
                question: "In 'Things Fall Apart', the death of Ikemefuna is significant because:",
                options: ["It marks the beginning of Okonkwo's downfall", "It brings peace to the village", "It strengthens Okonkwo's position", "It ends the war"],
                correct: 0
            },
            {
                question: "The literary device used in 'The moon is a queen' is:",
                options: ["Metaphor", "Simile", "Personification", "Hyperbole"],
                correct: 0
            },
            {
                question: "In 'The Lion and the Jewel', Lakunle represents:",
                options: ["Modernity", "Tradition", "Colonialism", "Nationalism"],
                correct: 0
            },
            {
                question: "A play that ends with the downfall of the protagonist is called:",
                options: ["Tragedy", "Comedy", "Farce", "Melodrama"],
                correct: 0
            },
            {
                question: "The narrator in a literary work who knows everything about the characters is:",
                options: ["Omniscient narrator", "First-person narrator", "Limited narrator", "Objective narrator"],
                correct: 0
            },
            {
                question: "The use of 'winter' to represent old age is an example of:",
                options: ["Symbolism", "Irony", "Satire", "Paradox"],
                correct: 0
            },
            {
                question: "A speech made by a character alone on stage is:",
                options: ["Soliloquy", "Monologue", "Dialogue", "Aside"],
                correct: 0
            },
            {
                question: "The literary term for a hint of future events is:",
                options: ["Foreshadowing", "Flashback", "Suspense", "Cliffhanger"],
                correct: 0
            },
            {
                question: "A poem of mourning for the dead is called:",
                options: ["Elegy", "Ode", "Sonnet", "Ballad"],
                correct: 0
            },
            {
                question: "The protagonist in a literary work is:",
                options: ["The main character", "The villain", "The narrator", "The author"],
                correct: 0
            },
            {
                question: "The antagonist in a literary work is:",
                options: ["The character opposing the protagonist", "The main character", "The narrator", "The author"],
                correct: 0
            },
            {
                question: "A comparison using 'like' or 'as' is:",
                options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
                correct: 0
            },
            {
                question: "The central idea or message of a literary work is:",
                options: ["Theme", "Plot", "Setting", "Character"],
                correct: 0
            },
            {
                question: "A 14-line poem is called:",
                options: ["Sonnet", "Ode", "Elegy", "Ballad"],
                correct: 0
            },
            {
                question: "The sequence of events in a story is:",
                options: ["Plot", "Theme", "Setting", "Character"],
                correct: 0
            },
            {
                question: "A figure of speech that exaggerates for effect is:",
                options: ["Hyperbole", "Simile", "Metaphor", "Irony"],
                correct: 0
            },
            {
                question: "The time and place of a literary work is:",
                options: ["Setting", "Plot", "Theme", "Character"],
                correct: 0
            },
            {
                question: "A play that is humorous and ends happily is:",
                options: ["Comedy", "Tragedy", "Farce", "Melodrama"],
                correct: 0
            },
            {
                question: "The repetition of initial consonant sounds is:",
                options: ["Alliteration", "Assonance", "Rhyme", "Onomatopoeia"],
                correct: 0
            },
            {
                question: "A word that imitates a sound is:",
                options: ["Onomatopoeia", "Alliteration", "Assonance", "Rhyme"],
                correct: 0
            }
        ]
    },

    crs: {
        name: "Christian Religious Studies",
        icon: "✝️",
        questions: [
            {
                question: "According to Matthew's Gospel, the Beatitudes were delivered on:",
                options: ["A mountain", "A plain", "A boat", "A synagogue"],
                correct: 0
            },
            {
                question: "The significance of the Transfiguration was to:",
                options: ["Reveal Jesus' divine nature", "Show Jesus' humanity", "Predict Jesus' death only", "Show Moses' superiority"],
                correct: 0
            },
            {
                question: "In the parable of the Good Samaritan, the point Jesus made was that:",
                options: ["Neighbourliness transcends ethnic boundaries", "Priests are evil", "Samaritans are holy", "Travel is dangerous"],
                correct: 0
            },
            {
                question: "The main lesson from the story of the Prodigal Son is:",
                options: ["God's forgiveness for repentant sinners", "The danger of wealth", "The importance of farming", "The role of elder brothers"],
                correct: 0
            },
            {
                question: "According to Paul, justification is by:",
                options: ["Faith in Jesus Christ", "Works of the law", "Circumcision", "Temple sacrifice"],
                correct: 0
            },
            {
                question: "The Holy Spirit descended on the apostles on the day of:",
                options: ["Pentecost", "Passover", "Tabernacles", "Atonement"],
                correct: 0
            },
            {
                question: "The main message of the prophet Amos was:",
                options: ["Social justice and righteousness", "Temple worship", "Kingship", "Sacrifice"],
                correct: 0
            },
            {
                question: "According to James, faith without works is:",
                options: ["Dead", "Alive", "Perfect", "Sufficient"],
                correct: 0
            },
            {
                question: "Paul's conversion occurred on the road to:",
                options: ["Damascus", "Jerusalem", "Rome", "Antioch"],
                correct: 0
            },
            {
                question: "According to Jesus, the greatest commandment is:",
                options: ["Love God and love your neighbour", "Honour your parents", "Do not steal", "Keep the Sabbath"],
                correct: 0
            },
            {
                question: "The significance of Jesus' baptism was:",
                options: ["Identification with humanity's sin", "Showing John's superiority", "Starting his public ministry only", "Fulfilling Roman law"],
                correct: 0
            },
            {
                question: "The lesson from the story of Ananias and Sapphira is:",
                options: ["Honesty in giving to God", "The danger of wealth", "The importance of marriage", "The role of apostles"],
                correct: 0
            },
            {
                question: "The main theme of the book of Job is:",
                options: ["The problem of suffering", "The importance of wealth", "The role of angels", "The history of Israel"],
                correct: 0
            },
            {
                question: "In the creation account, man was created on the:",
                options: ["Sixth day", "Fifth day", "Fourth day", "Third day"],
                correct: 0
            },
            {
                question: "The significance of the Last Supper is:",
                options: ["Institution of the Holy Communion", "Jesus' farewell speech only", "Prediction of Peter's denial", "Washing of feet"],
                correct: 0
            },
            {
                question: "The prophet who confronted King David about Bathsheba was:",
                options: ["Nathan", "Elijah", "Isaiah", "Jeremiah"],
                correct: 0
            },
            {
                question: "The fruit of the Spirit according to Paul includes:",
                options: ["Love, joy, peace", "Wealth, power, fame", "Pride, greed, lust", "Anger, envy, sloth"],
                correct: 0
            },
            {
                question: "The significance of the resurrection of Jesus is:",
                options: ["Victory over death and sin", "Fulfillment of Roman law", "Political liberation", "Temple reconstruction"],
                correct: 0
            },
            {
                question: "The main lesson from the parable of the talents is:",
                options: ["Faithfulness in stewardship", "The danger of wealth", "The importance of farming", "The role of servants"],
                correct: 0
            },
            {
                question: "According to the Bible, the wages of sin is:",
                options: ["Death", "Poverty", "Sickness", "Sorrow"],
                correct: 0
            }
        ]
    },

    geography: {
        name: "Geography",
        icon: "🌍",
        questions: [
            {
                question: "The process by which rocks are broken down by chemical reactions is:",
                options: ["Chemical weathering", "Physical weathering", "Biological weathering", "Erosion"],
                correct: 0
            },
            {
                question: "A line on a map joining points of equal rainfall is:",
                options: ["Isohyet", "Isotherm", "Isobar", "Contour"],
                correct: 0
            },
            {
                question: "The type of rainfall associated with the Inter-Tropical Convergence Zone is:",
                options: ["Convectional", "Relief", "Frontal", "Cyclonic"],
                correct: 0
            },
            {
                question: "The process by which a river deposits its load at its mouth is:",
                options: ["Delta formation", "Erosion", "Transportation", "Attrition"],
                correct: 0
            },
            {
                question: "A map scale of 1:50,000 means that 1cm on the map represents:",
                options: ["0.5 km", "5 km", "50 km", "500 km"],
                correct: 0
            },
            {
                question: "The phenomenon where the sun is directly overhead at the Tropic of Cancer occurs in:",
                options: ["June", "December", "March", "September"],
                correct: 0
            },
            {
                question: "The instrument used to measure atmospheric pressure is:",
                options: ["Barometer", "Thermometer", "Hygrometer", "Anemometer"],
                correct: 0
            },
            {
                question: "The main cause of tides in oceans is:",
                options: ["Gravitational pull of the moon", "Wind", "Earthquakes", "Ocean currents"],
                correct: 0
            },
            {
                question: "A plateau is best described as:",
                options: ["An elevated flat land", "A lowland plain", "A mountain peak", "A river valley"],
                correct: 0
            },
            {
                question: "The type of soil erosion caused by wind in arid regions is:",
                options: ["Aeolian erosion", "Fluvial erosion", "Glacial erosion", "Marine erosion"],
                correct: 0
            },
            {
                question: "The imaginary line at 0° latitude is:",
                options: ["Equator", "Prime Meridian", "Tropic of Cancer", "Tropic of Capricorn"],
                correct: 0
            },
            {
                question: "The main factor affecting temperature variation on Earth is:",
                options: ["Latitude", "Longitude", "Altitude", "Ocean currents"],
                correct: 0
            },
            {
                question: "The vegetation type found in the equatorial region is:",
                options: ["Rainforest", "Savanna", "Desert", "Tundra"],
                correct: 0
            },
            {
                question: "The process by which water changes from liquid to vapour is:",
                options: ["Evaporation", "Condensation", "Precipitation", "Infiltration"],
                correct: 0
            },
            {
                question: "The largest ocean in the world is:",
                options: ["Pacific", "Atlantic", "Indian", "Arctic"],
                correct: 0
            },
            {
                question: "The type of rock formed from cooled magma is:",
                options: ["Igneous", "Sedimentary", "Metamorphic", "Limestone"],
                correct: 0
            },
            {
                question: "The process by which a river wears away its bed and banks is:",
                options: ["Erosion", "Deposition", "Transportation", "Weathering"],
                correct: 0
            },
            {
                question: "The layer of the atmosphere closest to the Earth's surface is:",
                options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
                correct: 0
            },
            {
                question: "The main cause of day and night is:",
                options: ["Rotation of the Earth", "Revolution of the Earth", "Tilt of the Earth", "Orbit of the moon"],
                correct: 0
            },
            {
                question: "The type of farming that involves the rearing of animals is:",
                options: ["Pastoral farming", "Arable farming", "Mixed farming", "Subsistence farming"],
                correct: 0
            }
        ]
    },

    commerce: {
        name: "Commerce",
        icon: "💼",
        questions: [
            {
                question: "The function of commerce that involves moving goods from producers to consumers is:",
                options: ["Trade", "Aids to trade", "Production", "Manufacturing"],
                correct: 0
            },
            {
                question: "A document sent by a seller to a buyer requesting payment is:",
                options: ["Invoice", "Receipt", "Credit note", "Debit note"],
                correct: 0
            },
            {
                question: "The type of business organization where members share profits and losses is:",
                options: ["Partnership", "Sole proprietorship", "Public corporation", "Cooperative"],
                correct: 0
            },
            {
                question: "The principle of insurance where the insured must disclose all material facts is:",
                options: ["Utmost good faith", "Indemnity", "Subrogation", "Contribution"],
                correct: 0
            },
            {
                question: "The process of transporting goods by sea is called:",
                options: ["Shipping", "Freighting", "Haulage", "Carriage"],
                correct: 0
            },
            {
                question: "A document that serves as evidence of ownership of goods in transit is:",
                options: ["Bill of lading", "Invoice", "Waybill", "Consignment note"],
                correct: 0
            },
            {
                question: "A warehouse where goods are stored until duty is paid is:",
                options: ["Bonded warehouse", "Private warehouse", "Public warehouse", "Cooperative warehouse"],
                correct: 0
            },
            {
                question: "A cheque that has been crossed cannot be:",
                options: ["Cashed over the counter", "Deposited in a bank", "Endorsed", "Transferred"],
                correct: 0
            },
            {
                question: "The main advantage of a cooperative society is:",
                options: ["Members share profits equitably", "Government control", "Limited liability", "Large capital base"],
                correct: 0
            },
            {
                question: "The purpose of a trade mark is to:",
                options: ["Identify a product", "Advertise a product", "Price a product", "Distribute a product"],
                correct: 0
            },
            {
                question: "A bank account that allows withdrawal by cheque is:",
                options: ["Current account", "Savings account", "Fixed deposit", "Domiciliary account"],
                correct: 0
            },
            {
                question: "The type of advertising that promotes a company's image rather than a specific product is:",
                options: ["Institutional advertising", "Product advertising", "Informative advertising", "Persuasive advertising"],
                correct: 0
            },
            {
                question: "The function of a retailer is to:",
                options: ["Sell directly to consumers", "Sell to wholesalers", "Manufacture goods", "Import goods"],
                correct: 0
            },
            {
                question: "The type of trade between two countries is:",
                options: ["International trade", "Home trade", "Retail trade", "Wholesale trade"],
                correct: 0
            },
            {
                question: "The document that contains terms and conditions of a contract of carriage is:",
                options: ["Consignment note", "Invoice", "Receipt", "Order form"],
                correct: 0
            },
            {
                question: "The process of buying and selling of goods and services within a country is:",
                options: ["Home trade", "Foreign trade", "International trade", "Entrepot trade"],
                correct: 0
            },
            {
                question: "A person who buys goods in large quantities from producers and sells to retailers is:",
                options: ["Wholesaler", "Retailer", "Consumer", "Agent"],
                correct: 0
            },
            {
                question: "The type of insurance that covers goods in transit is:",
                options: ["Marine insurance", "Fire insurance", "Life insurance", "Motor insurance"],
                correct: 0
            },
            {
                question: "The process of sending goods to another country for sale is:",
                options: ["Export", "Import", "Entrepot", "Barter"],
                correct: 0
            },
            {
                question: "The document that shows the details of goods sold and the amount due is:",
                options: ["Invoice", "Receipt", "Credit note", "Debit note"],
                correct: 0
            }
        ]
    },

    financialAccounting: {
        name: "Financial Accounting",
        icon: "🧾",
        questions: [
            {
                question: "If assets are ₦500,000 and liabilities are ₦200,000, what is the owner's equity?",
                options: ["₦300,000", "₦700,000", "₦200,000", "₦500,000"],
                correct: 0
            },
            {
                question: "The accounting concept that requires transactions to be recorded at their original cost is:",
                options: ["Historical cost concept", "Going concern concept", "Matching concept", "Accrual concept"],
                correct: 0
            },
            {
                question: "A purchase of goods on credit will:",
                options: ["Increase assets and increase liabilities", "Decrease assets and decrease liabilities", "Increase assets only", "Decrease liabilities only"],
                correct: 0
            },
            {
                question: "The trial balance is prepared to:",
                options: ["Check the arithmetical accuracy of the ledger", "Determine profit", "Show financial position", "Record transactions"],
                correct: 0
            },
            {
                question: "If opening stock is ₦50,000, purchases ₦200,000, and closing stock ₦30,000, calculate cost of goods sold.",
                options: ["₦220,000", "₦250,000", "₦230,000", "₦180,000"],
                correct: 0
            },
            {
                question: "The double entry for cash sales is:",
                options: ["Debit Cash, Credit Sales", "Debit Sales, Credit Cash", "Debit Cash, Credit Capital", "Debit Purchases, Credit Cash"],
                correct: 0
            },
            {
                question: "A credit balance in the cash book represents:",
                options: ["Bank overdraft", "Cash in hand", "Bank balance", "Petty cash"],
                correct: 0
            },
            {
                question: "If sales is ₦500,000, cost of goods sold is ₦350,000, calculate gross profit.",
                options: ["₦150,000", "₦850,000", "₦200,000", "₦100,000"],
                correct: 0
            },
            {
                question: "The provision for doubtful debts is created to:",
                options: ["Cover possible losses from bad debts", "Increase profit", "Reduce expenses", "Increase debtors"],
                correct: 0
            },
            {
                question: "The accounting equation is expressed as:",
                options: ["Assets = Liabilities + Capital", "Assets = Capital - Liabilities", "Capital = Assets + Liabilities", "Liabilities = Assets + Capital"],
                correct: 0
            },
            {
                question: "Depreciation is charged to:",
                options: ["Match cost of asset with revenue it generates", "Increase asset value", "Reduce liabilities", "Increase capital"],
                correct: 0
            },
            {
                question: "The accounting period concept assumes that:",
                options: ["Business life is divided into equal periods", "Business will continue indefinitely", "Transactions are recorded at cost", "Revenue is recognized when earned"],
                correct: 0
            },
            {
                question: "The statement that shows the financial position of a business is:",
                options: ["Balance sheet", "Income statement", "Trading account", "Cash flow statement"],
                correct: 0
            },
            {
                question: "An increase in an expense account is recorded as:",
                options: ["Debit", "Credit", "Either debit or credit", "No entry"],
                correct: 0
            },
            {
                question: "If the opening capital is ₦100,000, drawings ₦20,000, and additional capital ₦50,000, calculate closing capital before profit.",
                options: ["₦130,000", "₦170,000", "₦150,000", "₦120,000"],
                correct: 0
            },
            {
                question: "The book in which transactions are first recorded is:",
                options: ["Journal", "Ledger", "Trial balance", "Balance sheet"],
                correct: 0
            },
            {
                question: "The excess of current assets over current liabilities is:",
                options: ["Working capital", "Fixed capital", "Capital employed", "Net worth"],
                correct: 0
            },
            {
                question: "A statement showing the assets and liabilities of a business is:",
                options: ["Balance sheet", "Trading account", "Profit and loss account", "Cash book"],
                correct: 0
            },
            {
                question: "The process of transferring entries from the journal to the ledger is:",
                options: ["Posting", "Balancing", "Casting", "Journalizing"],
                correct: 0
            },
            {
                question: "A reduction in the price of goods sold due to prompt payment is:",
                options: ["Cash discount", "Trade discount", "Allowance", "Rebate"],
                correct: 0
            }
        ]
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = quizData;
}
```
           
