<template>
  <div v-if="isVisible" class="popup-overlay" @click="closePopup">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h2 class="area-title">{{ areaInfo.name }}</h2>
        <button class="close-btn" @click="closePopup">×</button>
      </div>
      
      <div class="popup-body">
        <div class="dispositions-section">
          <h3 class="section-title">Key Dispositions</h3>
          <ul class="dispositions-list">
            <li v-for="disposition in areaInfo.dispositions" :key="disposition.name" class="disposition-item">
              <strong>{{ disposition.name }}:</strong> {{ disposition.description }}
            </li>
          </ul>
        </div>
        
        <div class="description-section">
          <h3 class="section-title">Area Description</h3>
          <div class="description-text">
            {{ areaInfo.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  areaCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const isVisible = computed(() => props.visible)

// CS Areas data with descriptions and dispositions
const csAreasData = {
  'AI': {
    name: 'Artificial Intelligence (AI)',
    dispositions: [
      { name: 'Meticulous', description: 'Since attention must be paid to details when implementing AI and machine learning algorithms, students must be meticulous about detail.' },
      { name: 'Persistent', description: 'AI techniques often operate in partially observable environments and optimization processes may have cascading errors from multiple iterations. Getting AI techniques to work predictably takes trial and error, and repeated effort.' },
      { name: 'Inventive', description: 'Applications of AI involve creative problem formulation and application of AI techniques, while balancing application requirements and societal and ethical issues.' },
      { name: 'Responsible', description: 'Applications of AI can have significant impacts on society, affecting both individuals and large populations. This calls for students to understand the implications of work in AI to society.' }
    ],
    description: `Artificial intelligence (AI) studies problems that are difficult or impractical to solve with traditional algorithmic approaches. These problems are often reminiscent of those considered to require human intelligence, and the resulting AI solution strategies typically generalize over classes of problems. 

AI techniques are now pervasive in computing, supporting everyday applications such as email, social media, photography, financial markets, and intelligent virtual assistants (e.g., Siri, Alexa). These techniques are also used in the design and analysis of autonomous agents that perceive their environment and interact rationally with it, such as self-driving vehicles and other robots.

Traditionally, AI has included a mix of symbolic and subsymbolic approaches. The solutions it provides rely on a broad set of general and specialized knowledge representation schemes, problem solving mechanisms, and optimization techniques. These approaches deal with perception (e.g., speech recognition, natural language understanding, computer vision), problem solving (e.g., search, planning, optimization), generation (e.g., narrative, conversation, images, models, recommendations), acting (e.g., robotics, task-automation, control), and the architectures needed to support them (e.g., single agents, multi-agent systems).

Machine learning may be used within each of these aspects and can even be employed end-to-end across all of them. The study of Artificial Intelligence prepares students to determine when an AI approach is appropriate for a given problem, identify appropriate representations and reasoning mechanisms, implement them, and evaluate them with respect to both performance and their broader societal impact.

Over the past decade, the term "artificial intelligence" has become commonplace within businesses, news articles, and everyday conversation, driven largely by a series of high-impact machine learning applications. These advances were made possible by the widespread availability of large datasets, increased computational power, and algorithmic improvements.

In particular, there has been a shift from engineered representations to representations learned automatically through optimization over large datasets. The resulting advances have put such terms as "neural networks" and "deep learning" into everyday vernacular. Businesses now advertise AI-based solutions as value-additions to their services, so that "artificial intelligence" is now both a technical term and a marketing buzzword.

Other disciplines, such as biology, art, architecture, and finance, increasingly use AI techniques to solve problems within their disciplines. For the first time in our history, the broader population has access to sophisticated AI-driven tools, including tools to generate essays or poems from a prompt, artwork from a description, and fake photographs or videos depicting real people.

AI technology is now in widespread use in stock trading, curating our news and social media feeds, automated evaluation of job applicants, detection of medical conditions, and influencing prison sentencing through recidivism prediction. Consequently, AI technology can have significant societal impacts and ethical considerations that must be understood and considered when developing and applying it.`
  },
  'AL': {
    name: 'Algorithmic Foundations (AL)',
    dispositions: [
      { name: 'Meticulous', description: 'As an algorithm is a formal solution to a computational problem, attention to detail is important when developing and combining algorithms.' },
      { name: 'Persistent', description: 'As developing algorithmic solutions to computational problems can be challenging, computer scientists must be resolute in pursuing such solutions.' },
      { name: 'Inventive', description: 'As computer scientists develop algorithmic solutions to real-world problems, they must be inventive in developing solutions to these problems.' }
    ],
    description: 'Algorithms and data structures are fundamental to computer science, since every theoretical computation and applied program consists of algorithms that operate on data elements possessing some underlying structure. Selecting appropriate computational solutions to real-world problems benefits from understanding the theoretical and practical capabilities and limitations of available algorithms and paradigms, including their impact on the environment and society. Moreover, this understanding provides insight into the intrinsic nature of computation, computational problems, and computational problem-solving as well as possible solution techniques independent of programming language, programming paradigm, computer hardware, or other implementation aspects. This knowledge area focuses on the nature of computation including the concepts and skills required to design and analyze algorithms for solving real-world computational problems. It complements the implementation of algorithms and data structures found in the Software Development Foundations (SDF) knowledge area. As algorithms and data structures are essential in all advanced areas of computer science, this area provides the algorithmic foundations that every computer science graduate is expected to know. Exposure to the breadth of these foundational AL topics is designed to provide students with the basis for studying these topics in more depth, for studying additional computation and algorithm topics, and for learning advanced algorithms across a variety of CS knowledge areas and CS+X disciplines.'
  },
  'AR': {
    name: 'Architecture and Organization (AR)',
    dispositions: [
      { name: 'Self-directed', description: 'Students should increasingly become self-motivated to acquire complementary knowledge.' },
      { name: 'Proactive', description: 'Students should exercise control and anticipate issues related to the underlying computer system.' }
    ],
    description: 'Computing professionals spend considerable time writing efficient code to solve a particular problem in an application domain. As the shift from sequential to parallel processing occurs, a deeper understanding of the underlying computer architectures is necessary. Architecture can no longer be viewed as a black box where principles from one architecture can be applied to another. Instead, programmers should look inside the black box and use specific components to enhance system performance and energy efficiency. The Architecture and Organization (AR) knowledge area aims to develop a deeper understanding of the hardware environments upon which almost all computing is based, and the relevant interfaces provided to higher software layers. The target hardware comprises low-end embedded system processors up to high-end enterprise multiprocessors. The topics in this knowledge area will benefit students by enabling them to appreciate the fundamental architectural principles of modern computer systems, including the challenge of harnessing parallelism to sustain performance and energy improvements into the future. This KA will help computer science students depart from the black box approach and become more aware of the underlying computer system and the efficiencies specific architectures can achieve.'
  },
  'DM': {
    name: 'Data Management (DM)',
    dispositions: [
      { name: 'Meticulous', description: 'Those who either access or store data collections must be meticulous in fulfilling data ownership responsibilities.' },
      { name: 'Responsible', description: 'Data are managed responsibly. Protection from unauthorized access as well as prevention of irresponsible use of data is paramount.' },
      { name: 'Collaborative', description: 'Data managers and data users must behave in a collaborative fashion to ensure that the correct data are accessed and used appropriately.' },
      { name: 'Responsive', description: 'The data that get stored and are accessed are always in response to an institutional need/request.' }
    ],
    description: 'Since the mid-1970s, the study of Data Management has evolved from an almost exclusive study of relational database systems to include emerging technologies like NoSQL, cloud databases, and big data analytics. Today\'s graduates need to understand the data life cycle, social/legal aspects of data collection including privacy and security, and emerging roles in data management from product feature engineers to data custodians.'
  },
  'FPL': {
    name: 'Foundations of Programming Languages (FPL)',
    dispositions: [
      { name: 'Professional', description: 'Students must demonstrate and apply the highest standards when using programming languages and formal methods to build safe systems.' },
      { name: 'Meticulous', description: 'Attention to detail is essential when using programming languages and applying formal methods.' },
      { name: 'Inventive', description: 'Programming and approaches to formal proofs is inherently a creative process, students must demonstrate innovative approaches.' },
      { name: 'Proactive', description: 'Programmers are responsible for anticipating all forms of user input and system behavior.' },
      { name: 'Persistent', description: 'Students must demonstrate perseverance since the correct approach is not always self-evident.' }
    ],
    description: 'The foundations of programming languages are rooted in discrete mathematics, logic, and formal languages, providing a basis for understanding complex modern programming languages. This knowledge area is concerned with articulating underlying concepts and principles of programming languages, formal specification, implementation methods, and comparing strengths and weaknesses of various programming paradigms.'
  },
  'GIT': {
    name: 'Graphics and Interactive Techniques (GIT)',
    dispositions: [
      { name: 'Self-directed', description: 'Graphics hardware and software evolves rapidly. Students need to understand the importance of being a life-long learner.' },
      { name: 'Collaborative', description: 'Graphics developers typically work in diverse teams composed of people with disparate subject matter expertise.' },
      { name: 'Effective communicator', description: 'Communication is critical. Students\' technical communication should be practiced and evaluated.' },
      { name: 'Creative', description: 'Creative problem-solving lies at the core of computer graphics.' }
    ],
    description: 'Computer graphics is the science of enabling visual communication through computation. Its application domains include animation, CGI and VFX, engineering, machine learning, medical imaging, scientific visualization, simulators, user interfaces, and video games. Today\'s graphics courses increasingly include data science, physical computing, animation, and haptics, expanding beyond traditional image-based computer graphics.'
  },
  'HCI': {
    name: 'Human-Computer Interaction (HCI)',
    dispositions: [
      { name: 'Adaptable', description: 'An HCI practitioner should be adaptable to address dynamic changes in technology, user needs, and design challenges.' },
      { name: 'Meticulous', description: 'An HCI practitioner should be meticulous in ensuring that their products are both user friendly and meet project objectives.' },
      { name: 'Empathetic', description: 'An HCI practitioner must demonstrate understanding of the user\'s needs.' },
      { name: 'Team-oriented', description: 'The successful HCI practitioner should focus on the success of the team.' },
      { name: 'Inventive', description: 'An HCI practitioner should design solutions that blend past practice, audience needs, and HCI fundamentals creatively.' }
    ],
    description: 'Computational systems not only enable users to solve problems, but also foster social connectedness and support a broad variety of human endeavors. Thus, these systems should work well with their users and solve problems in ways that respect individual dignity, social justice, and human values and creativity. Human-computer interaction (HCI) addresses those issues from an interdisciplinary perspective that includes computer science, psychology, business strategy, and design principles. Each user is different and, from the perspective of HCI, the design of every system that interacts with people should anticipate and respect that diversity. This includes not only accessibility, but also cultural and societal norms, neural diversity, modality, and the responses the system elicits in its users. An effective computational system should evoke trust while it treats its users fairly, respects their privacy, provides security, and abides by ethical principles. These goals require design-centric engineering that begins with intention and with the understanding that design is an iterative process, one that requires repeated evaluation of its usability and its impact on its users. Moreover, technology evokes user responses, not only by its output, but also by the modalities with which it senses and communicates. This knowledge area heightens the awareness of these issues and should influence every computer scientist.'
  },
  'MSF': {
    name: 'Mathematical and Statistical Foundations (MSF)',
    dispositions: [
      { name: 'Growth mindset', description: 'Students should be persuaded that anyone can learn mathematics and that success is not dependent on innate ability.' },
      { name: 'Practice mindset', description: 'Students should understand the nature of "doing" mathematics through practice with problems.' },
      { name: 'Deferred gratification', description: 'Students should be patient to see computing applications of mathematical concepts.' },
      { name: 'Persistence', description: 'Eventually success through persistence is what matters, not immediate understanding.' },
      { name: 'Skepticism and inquiry', description: 'Students should feature skepticism and curiosity about how formulas are established.' }
    ],
    description: 'A strong mathematical foundation remains a bedrock of computer science education and infuses the practice of computing whether in developing algorithms, designing systems, modeling real-world phenomena, or computing with data. This Mathematical and Statistical Foundations (MSF) knowledge area – the successor to the ACM CS2013 curriculum\'s "Discrete Structures" area – seeks to identify the mathematical and statistical material that undergirds modern computer science. The change of name corresponds to a realization both that the broader name better describes the combination of topics from the 2013 report and from those required for the recently growing areas of computer science, such as artificial intelligence, machine learning, data science, and quantum computing, many of which have continuous mathematics as their foundations.'
  },
  'NC': {
    name: 'Networking and Communication (NC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students must be particular about the specifics of understanding and creating networking protocols.' },
      { name: 'Collaborative', description: 'Students must work together to develop multiple components that interact and respond to failures and threats.' },
      { name: 'Proactive', description: 'Students must predict failures and threats while avoiding reactive modes of operation.' },
      { name: 'Professional', description: 'Students must comply with community needs and regulatory body demands.' },
      { name: 'Responsive', description: 'Students must act swiftly to changes in network configurations and user requirements.' },
      { name: 'Adaptive', description: 'Students need to reconfigure systems under varying modes of operation.' }
    ],
    description: `Networking and communication play a central role in interconnected computer systems that are transforming the daily lives of billions of people. The public internet provides connectivity for networked applications that serve ever-increasing numbers of individuals and organizations around the world. Complementing the public sector, major proprietary networks leverage their global footprints to support cost-effective distributed computing, storage, and content delivery. Advances in satellite networks expand connectivity to rural areas. Device-to-device communication underlies the emerging Internet of Things.

This knowledge area deals with key concepts in networking and communication, as well as their representative instantiations in the internet and other computer networks. Besides the basic principles of switching and layering, the area at its core provides knowledge on naming, addressing, reliability, error control, flow control, congestion control, domain hierarchy, routing, forwarding, modulation, encoding, framing, and access control. The area also covers knowledge units in network security and mobility, such as security threats, countermeasures, device-to-device communication, and multi-hop wireless networking. In addition to the fundamental principles, the area includes their specific realization of the Internet as well as hands-on skills in the implementation of networking and communication concepts. Finally, the area comprises emerging topics such as network virtualization and quantum networking.

As the main learning outcome, learners develop a thorough understanding of the role and operation of networking and communication in networked computer systems. They learn how network structure and communication protocols affect the behavior of distributed applications. The area can be used to educate not only key principles but also their specific instantiations in the internet and equip the student with hands-on implementation skills. While computer-system, networking, and communication technologies are advancing at a fast pace, the gained fundamental knowledge enables the student to readily apply the concepts in new technological settings.`
  },
  'OS': {
    name: 'Operating Systems (OS)',
    dispositions: [
      { name: 'Proactive', description: 'Students must anticipate the security and performance implications of how operating systems components are used.' },
      { name: 'Meticulous', description: 'Students must carefully analyze the implications of operating system mechanisms on any project.' }
    ],
    description: 'The operating system is a collection of services needed to safely interface hardware with applications. Core topics focus on mechanisms and policies needed to virtualize computation, memory, and Input/Output. The Operating Systems knowledge area contains key underlying concepts for other areas including trust boundaries, concurrency, persistence, and safe extensibility.'
  },
  'PDC': {
    name: 'Parallel and Distributed Computing (PDC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students\' attention to detail is essential when applying constructs with non-obvious correctness conditions.' },
      { name: 'Persistent', description: 'Students must be prepared to try alternative approaches when solutions are not self evident.' }
    ],
    description: 'Parallel and distributed programming arranges, coordinates, and controls multiple computations occurring simultaneously across different places. This knowledge area has evolved from advanced topics into central body of knowledge, permeating almost every aspect of computing. Students learn techniques for establishing and coordinating activities that may occur at the same time or in different places.'
  },
  'SDF': {
    name: 'Software Development Fundamentals (SDF)',
    dispositions: [
      { name: 'Self-Directed', description: 'Students must seek out solutions to issues on their own using technical forums, FAQs, and discussions.' },
      { name: 'Experimental', description: 'Students must experiment with language features to understand them and prototype solutions.' },
      { name: 'Technical curiosity', description: 'Students must develop interest in understanding how programs are executed and stored in memory.' },
      { name: 'Adaptable', description: 'Students must be willing to learn and use different tools and technologies for software development.' },
      { name: 'Persistent', description: 'Students must continue efforts until bugs are identified and programs work satisfactorily.' },
      { name: 'Meticulous', description: 'Students must pay attention to detail and use orderly processes while programming.' }
    ],
    description: 'Fluency in software development is fundamental to computer science study. This knowledge area brings together fundamental concepts and skills related to software development, focusing on concepts taught early in a computer science program. This includes fundamental programming concepts, use of data structures, programming practices for quality code, and understanding algorithmic performance impact.'
  },
  'SE': {
    name: 'Software Engineering (SE)',
    dispositions: [
      { name: 'Collaborative', description: 'Software engineering is a "team sport" – successful engineers work with others effectively through humility, respect, and trust.' },
      { name: 'Professional', description: 'Software engineering produces technology influencing billions of people, requiring ethical behavior and societal awareness.' },
      { name: 'Communicative', description: 'Successful software projects depend on engineers communicating clearly and regularly to coordinate effectively.' },
      { name: 'Meticulous', description: 'Software engineering requires attention to detail and consistent behavior from everyone on the team.' },
      { name: 'Responsible', description: 'Taking responsibility, following through, and keeping others informed are essential for team success.' }
    ],
    description: `Software engineering is the multi-person construction of multi-version programs, distinct from programming in two dimensions: time and people. It's a team endeavor requiring communication and collaboration skills, and projects have expected lifespans requiring long-term maintenance and evolution. 

Software engineering is distinguished from programming by the increased complexity that comes with size: more programmers involved, more time spent in development and maintenance, more features, and more lines of code. This increased complexity leads to difficulties in communication and coordination among developers, leads to more opportunities for faults, increases the economic importance of maintainability and reusability, and necessitates more specialized roles.

The field encompasses both product and process – both the artifacts produced and the methods used to produce them. Software engineering involves problem solving and intellectual challenges, but is also fundamentally about designing, building, and maintaining human-built artifacts. The field requires balancing competing constraints including performance, security, costs, risks, and deadlines.

Key topics include testing, teamwork, communication, design, maintenance, and software engineering tools. Students learn systematic approaches to software development, including requirements analysis, design patterns, version control, testing strategies, and project management. The curriculum emphasizes both technical skills and professional practices essential for successful software development in team environments.`
  },
  'SEC': {
    name: 'Security (SEC)',
    dispositions: [
      { name: 'Meticulous', description: 'Students need to pay careful attention to details to ensure protection of real-world software systems.' },
      { name: 'Self-directed', description: 'Students must be ready to deal with novel and unforeseeable ways adversaries might launch attacks.' },
      { name: 'Collaborative', description: 'Students must collaborate with others, as collective knowledge and skills are needed to prevent attacks.' },
      { name: 'Responsible', description: 'Students need responsibility when designing, developing, deploying, and maintaining secure systems.' },
      { name: 'Accountable', description: 'Students need to know they will be held accountable if system or data breaches occur.' }
    ],
    description: 'Computing supports nearly every facet of modern critical infrastructure. The Security knowledge area focuses on developing a security mindset so that security is embedded in all work products. Students learn about system vulnerabilities, threats, and crosscutting concepts including confidentiality, integrity, availability, risk assessment, systems thinking, adversarial thinking, and human-centered thinking.'
  },
  'SEP': {
    name: 'Society, Ethics and Profession (SEP)',
    dispositions: [
      { name: 'Critically Self-reflective', description: 'Students should inspect their own actions, thoughts, biases, and privileges to discover areas for improvement.' },
      { name: 'Responsive', description: 'Students must quickly and accurately respond to changes in the field and adapt professionally.' },
      { name: 'Proactive', description: 'Students must identify areas of importance in accessibility and inclusion and address them.' },
      { name: 'Culturally Competent', description: 'Students must prioritize working with people from different cultures using inclusive language.' },
      { name: 'Advocative', description: 'Students must foster and promote diversity, equity, inclusion, and accessibility in all work.' },
      { name: 'Responsible', description: 'Students must act responsibly toward all users, stakeholders, colleagues, and society at large.' }
    ],
    description: 'Computing professionals\' actions change the world, and they should reflect upon wider impacts of their work, consistently supporting the public good. Students must understand critical social, ethical, legal, and professional issues and responsibilities. This includes understanding cultural, social, legal, and ethical issues inherent in computing and the ability to evaluate the social impact of computing systems.'
  },
  'SF': {
    name: 'Systems Fundamentals (SF)',
    dispositions: [
      { name: 'Meticulous', description: 'Students must pay attention to details of different perspectives when learning about and evaluating systems.' },
      { name: 'Adaptive', description: 'Students must be flexible when designing systems, as different systems have different requirements and constraints.' }
    ],
    description: 'A computer system is a set of hardware and software infrastructures upon which applications are constructed. This knowledge area focuses on fundamental concepts and design principles in computer systems shared across multiple areas. The goal is to present an integrative view of fundamental concepts in a unified fashion, providing common foundation for specialized mechanisms and policies.'
  },
  'SPD': {
    name: 'Specialized Platform Development (SPD)',
    dispositions: [
      { name: 'Self-Directed', description: 'Students should learn new platforms and languages with a growth-oriented mindset and thrive in dynamic environments.' },
      { name: 'Inventive', description: 'Students should demonstrate excellence in designing software architecture within unconventional constraints.' },
      { name: 'Adaptable', description: 'Students should adapt to diverse challenges, showing resilience and proactive approach to changing requirements.' }
    ],
    description: 'The Specialized Platform Development (SPD) knowledge area refers to attributes involving the creation of software targeting non-traditional hardware platforms. Developing for each specialized platform, for example, robots, mobile systems, web-based systems, and embedded systems, typically involves unique considerations. Societal and industry needs have created a high demand for developers on specialized platforms, such as mobile applications, web platforms, robotic platforms, and embedded systems. Some unique professional abilities relevant to this knowledge area include creating applications that provide a consistent user experience across various devices, screen sizes, and operating systems; developing application programming interfaces (APIs) to support the functionality of each specialized platform; managing challenges related to resource constraints such as computation, memory, storage, and networking and communication; and applying cross-cutting concerns such as optimization, security, better development practices, etc.'
  }
}

const areaInfo = computed(() => {
  return csAreasData[props.areaCode] || {
    name: 'Unknown Area',
    dispositions: [],
    description: 'No description available.'
  }
})

const closePopup = () => {
  emit('close')
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.popup-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  margin-top: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.area-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.popup-body {
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 1.1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.dispositions-section {
  margin-bottom: 2rem;
}

.dispositions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.disposition-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.disposition-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.disposition-item strong {
  color: #1e40af;
  font-weight: 600;
}

.description-section {
}

.description-text {
  line-height: 1.8;
  color: #4b5563;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.95rem;
  white-space: pre-line;
  text-align: justify;
}

@media (max-width: 768px) {
  .popup-overlay {
    padding: 1rem;
  }
  
  .popup-content {
    margin-top: 1rem;
    max-height: 95vh;
  }
  
  .popup-header {
    padding: 1rem 1.5rem 0.75rem;
  }
  
  .area-title {
    font-size: 1.25rem;
  }
  
  .popup-body {
    padding: 1rem 1.5rem 1.5rem;
  }
}
</style> 