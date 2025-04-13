const { getChapterExplanation } = require("./geminiService");

const dummyChapter = `
History
Main articles: History of electromagnetic theory and History of electrical engineering
See also: Etymology of electricity
A bust of a bearded man with dishevelled hair
Thales, the earliest known researcher into electricity
Long before any knowledge of electricity existed, people were aware of shocks from electric fish. Ancient Egyptian texts dating from 2750 BCE described them as the "protectors" of all other fish. Electric fish were again reported millennia later by ancient Greek, Roman and Arabic naturalists and physicians.[2] Several ancient writers, such as Pliny the Elder and Scribonius Largus, attested to the numbing effect of electric shocks delivered by electric catfish and electric rays, and knew that such shocks could travel along conducting objects.[3] Patients with ailments such as gout or headache were directed to touch electric fish in the hope that the powerful jolt might cure them.[4]

Ancient cultures around the Mediterranean knew that certain objects, such as rods of amber, could be rubbed with cat's fur to attract light objects like feathers. Thales of Miletus made a series of observations on static electricity around 600 BCE, from which he believed that friction rendered amber magnetic, in contrast to minerals such as magnetite, which needed no rubbing.[5][6][7][8] Thales was incorrect in believing the attraction was due to a magnetic effect, but later science would prove a link between magnetism and electricity. According to a controversial theory, the Parthians may have had knowledge of electroplating, based on the 1936 discovery of the Baghdad Battery, which resembles a galvanic cell, though it is uncertain whether the artefact was electrical in nature.[9]

A half-length portrait of a bald, somewhat portly man in a three-piece suit.
Benjamin Franklin conducted extensive research on electricity in the 18th century, as documented by Joseph Priestley (1767) History and Present Status of Electricity, with whom Franklin carried on extended correspondence.
Electricity would remain little more than an intellectual curiosity for millennia until 1600, when the English scientist William Gilbert wrote De Magnete, in which he made a careful study of electricity and magnetism, distinguishing the lodestone effect from static electricity produced by rubbing amber.[5] He coined the Neo-Latin word electricus ("of amber" or "like amber", from ἤλεκτρον, elektron, the Greek word for "amber") to refer to the property of attracting small objects after being rubbed.[10] This association gave rise to the English words "electric" and "electricity", which made their first appearance in print in Thomas Browne's Pseudodoxia Epidemica of 1646.[11] Isaac Newton made early investigations into electricity,[12] with an idea of his written down in his book Opticks arguably the beginning of the field theory of the electric force.[13]

Further work was conducted in the 17th and early 18th centuries by Otto von Guericke, Robert Boyle, Stephen Gray and C. F. du Fay.[14] Later in the 18th century, Benjamin Franklin conducted extensive research in electricity, selling his possessions to fund his work. In June 1752 he is reputed to have attached a metal key to the bottom of a dampened kite string and flown the kite in a storm-threatened sky.[15] A succession of sparks jumping from the key to the back of his hand showed that lightning was indeed electrical in nature.[16] He also explained the apparently paradoxical behavior[17] of the Leyden jar as a device for storing large amounts of electrical charge in terms of electricity consisting of both positive and negative charges.[14]

Half-length portrait oil painting of a man in a dark suit
Michael Faraday's discoveries formed the foundation of electric motor technology.
In 1775, Hugh Williamson reported a series of experiments to the Royal Society on the shocks delivered by the electric eel;[18] that same year the surgeon and anatomist John Hunter described the structure of the fish's electric organs.[19][20] In 1791, Luigi Galvani published his discovery of bioelectromagnetics, demonstrating that electricity was the medium by which neurons passed signals to the muscles.[21][22][14] Alessandro Volta's battery, or voltaic pile, of 1800, made from alternating layers of zinc and copper, provided scientists with a more reliable source of electrical energy than the electrostatic machines previously used.[21][22] The recognition of electromagnetism, the unity of electric and magnetic phenomena, is due to Hans Christian Ørsted and André-Marie Ampère in 1819–1820. Michael Faraday invented the electric motor in 1821, and Georg Ohm mathematically analysed the electrical circuit in 1827.[22] Electricity and magnetism (and light) were definitively linked by James Clerk Maxwell, in particular in his "On Physical Lines of Force" in 1861 and 1862.[23]: 148 

While the early 19th century had seen rapid progress in electrical science, the late 19th century would see the greatest progress in electrical engineering. Through such people as Alexander Graham Bell, Ottó Bláthy, Thomas Edison, Galileo Ferraris, Oliver Heaviside, Ányos Jedlik, William Thomson, 1st Baron Kelvin, Charles Algernon Parsons, Werner von Siemens, Joseph Swan, Reginald Fessenden, Nikola Tesla and George Westinghouse, electricity turned from a scientific curiosity into an essential tool for modern life.[24]

In 1887, Heinrich Hertz[25]: 843–44 [26] discovered that electrodes illuminated with ultraviolet light create electric sparks more easily. In 1905, Albert Einstein published a paper that explained experimental data from the photoelectric effect as being the result of light energy being carried in discrete quantized packets, energising electrons. This discovery led to the quantum revolution. Einstein was awarded the Nobel Prize in Physics in 1921 for "his discovery of the law of the photoelectric effect".[27] The photoelectric effect is also employed in photocells such as can be found in solar panels.

The first solid-state device was the "cat's-whisker detector" first used in the 1900s in radio receivers. A whisker-like wire is placed lightly in contact with a solid crystal (such as a germanium crystal) to detect a radio signal by the contact junction effect.[28] In a solid-state component, the current is confined to solid elements and compounds engineered specifically to switch and amplify it. Current flow can be understood in two forms: as negatively charged electrons, and as positively charged electron deficiencies called holes. These charges and holes are understood in terms of quantum physics. The building material is most often a crystalline semiconductor.[29][30]

Solid-state electronics came into its own with the emergence of transistor technology. The first working transistor, a germanium-based point-contact transistor, was invented by John Bardeen and Walter Houser Brattain at Bell Labs in 1947,[31] followed by the bipolar junction transistor in 1948.[32]
`;

// Set explanation type for testing
const explanationType = "detailed"; // or "detailed"

async function testGemini() {
  console.log(`\n🔍 Requesting a ${explanationType} explanation from Gemini...`);
  const explanation = await getChapterExplanation(dummyChapter, explanationType);

  console.log(`\n📘 ${explanationType.toUpperCase()} EXPLANATION:\n`);
  console.log(explanation);
}

testGemini();
