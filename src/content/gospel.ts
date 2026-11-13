export type ParagraphPart = string | { text: string; href: string };

export type Paragraph = string | ParagraphPart[];

type GospelSection = {
    id: string;
    heading: string;
    paragraphs: Paragraph[];
    quote?: {
        text: string;
        author: string;
        source: string;
        href: string;
    };
    afterQuote?: string[];
    references: { label: string; href: string }[];
};

export const gospelIntroduction = "The gospel is the good news of God’s kingdom.";

export const gospelSections: GospelSection[] = [
    {
        id: "gods-kingdom",
        heading: "God’s kingdom",
        paragraphs: [
            "In Mark 1:15, Jesus declares that the kingdom of God is at hand and calls people to repent and believe in the gospel.",
            "What is the kingdom of God? It is God’s reign, His good and rightful rule over His creation. In Jesus, this reign has come near. He calls us to turn toward God and live according to His word, known as the Bible.",
        ],
        references: [
            { label: "Mark 1:14-15", href: "https://www.esv.org/Mark+1:14-15/" },
        ],
    },
    {
        id: "made-to-know-god",
        heading: "Made to know God",
        paragraphs: [
            "Who is God? He is our perfect, loving, and just Creator. We exist because God desired us, and He made us to know Him, love Him, and love one another.",
        ],
        quote: {
            text: "The chief end of man is to glorify God by enjoying Him forever.",
            author: "John Piper",
            source: "Christian Hedonism",
            href: "https://www.desiringgod.org/articles/christian-hedonism",
        },
        afterQuote: [
            "By “chief end,” Piper means our ultimate purpose. Glorifying God and finding our deepest satisfaction in Him belong together, but we tend to seek fulfillment in anything but Him.",
            "So, what’s the problem?",
        ],
        references: [
            { label: "Matthew 22:37-40", href: "https://www.esv.org/Matthew+22:37-40/" },
        ],
    },
    {
        id: "god-and-us",
        heading: "Dead in sin",
        paragraphs: [
            "The Bible calls the problem sin. Sin is anything we think, say, or do that goes against God’s law and grieves His heart. In other words, it is failure to love God or love our neighbor as we ought.",
            "Every one of us has sinned. We have turned away from the God who made us and chosen to live on our own terms. This rebellion harms our relationships and communities. We see its effects in greed, injustice, exploitation, and the suffering we cause one another.",
            "Because God is just, He must deal with sin. Love does not mean pretending evil is harmless; our sin makes us guilty before Him, and its punishment is death. When the Bible says we are dead in our sins, it means we are separated from God and unable to restore this relationship ourselves. We need forgiveness and new life.",
            "But how can a just God forgive us?",
        ],
        references: [
            { label: "Romans 3:23", href: "https://www.esv.org/Romans+3:23/" },
            { label: "Romans 6:23", href: "https://www.esv.org/Romans+6:23/" },
            { label: "Ephesians 2:1-5", href: "https://www.esv.org/Ephesians+2:1-5/" },
        ],
    },
    {
        id: "who-jesus-is",
        heading: "Fully God, fully man",
        paragraphs: [
            "God sent His only Son, Jesus Christ. Jesus is fully God in His divine nature and fully man in His human nature. Because He is truly human, He can stand in our place. Because He is God, He reveals God to us and has the power to give us life.",
            "Jesus also showed what God’s reign looks like. He healed the sick, cast out demons, and proclaimed good news to the poor. Through His words and actions, He showed us God’s love and taught us how to love one another.",
        ],
        references: [
            { label: "John 1:1-14", href: "https://www.esv.org/John+1:1-14/" },
            { label: "Luke 4:18-21", href: "https://www.esv.org/Luke+4:18-21/" },
        ],
    },
    {
        id: "the-cross-and-resurrection",
        heading: "Death and resurrection",
        paragraphs: [
            "Jesus lived the life we should have lived, yet died the death our sin deserved. Though He had no sin of His own, He willingly gave His life and shed His blood so that we could be forgiven. On the cross, God’s justice is satisfied and His mercy is offered to us.",
            "On the third day, Jesus rose from the dead. Death no longer has dominion over Him. The One who promises us eternal life is Himself alive and reigns in heaven. The kingdom He announced has a living King.",
        ],
        references: [
            { label: "1 Corinthians 15:3-8", href: "https://www.esv.org/1+Corinthians+15:3-8/" },
            { label: "Romans 6:9", href: "https://www.esv.org/Romans+6:9/" },
        ],
    },
    {
        id: "new-life",
        heading: "Alive in Christ",
        paragraphs: [
            "Salvation is a free gift from God. We can’t earn it; He saves us by grace, out of His own kindness. We receive it by doing what Jesus called people to do: repent and believe in the gospel.",
            "Though we were dead in our sins, God makes us alive in Christ. He takes our sin and gives us His righteousness so that we are reconciled to God as His children, even beyond life in these earthly bodies.",
            "How should we live this life, then?",
        ],
        references: [
            { label: "Ephesians 2:1-5", href: "https://www.esv.org/Ephesians+2:1-5/" },
            { label: "2 Corinthians 5:21", href: "https://www.esv.org/2+Corinthians+5:21/" },
        ],
    },
    {
        id: "living-in-his-kingdom",
        heading: "Living as His people",
        paragraphs: [
            "In Matthew 28:19-20, Jesus sends His followers to make disciples of all nations, baptizing them and teaching them to obey everything He commanded. We are called to share the gospel through our words and actions, just as He did, to help others come to know Him.",
            "This calling reaches into everyday life. Following Jesus means learning to love our neighbors, care for those who are suffering, and respond to the injustice around us.",
        ],
        references: [
            { label: "Matthew 28:19-20", href: "https://www.esv.org/Matthew+28:19-20/" },
        ],
    },
    {
        id: "my-story",
        heading: "My testimony",
        paragraphs: [
            "For much of university, I chose to reject God and live for myself. Among other things, I was addicted to video games and turned to substances and gambling. I had tasted and seen what the world had to offer, but I was still lost and unsatisfied.",
            "Since being saved by grace through faith in Jesus Christ, I have tasted and seen that His grace is sufficient. I can testify that nothing in this world can satisfy nearly as much as God’s love. Now my life’s mission is to share this love with everyone around me.",
        ],
        references: [
            { label: "Psalm 34:8", href: "https://www.esv.org/Psalm+34:8/" },
            { label: "2 Corinthians 12:9-10", href: "https://www.esv.org/2+Corinthians+12:9-10/" },
            { label: "Psalm 63:3", href: "https://www.esv.org/Psalm+63:3/" },
        ],
    },
    {
        id: "an-invitation",
        heading: "Come to Jesus",
        paragraphs: [
            "John 3:16 sums up the gospel: God loved the world so much that He gave His only Son, Jesus Christ, so that whoever believes in Him will have eternal life.",
            "If you don’t know Jesus as Lord and Savior, I invite you to come to Him. Turn away from your sin, put your faith in Christ, and receive the life He offers.",
            [
                "You don’t need to have every question answered before taking this step. If you have any, find a local church or ask me ",
                { text: "here", href: "/contact/" },
                "!",
            ],
        ],
        references: [
            { label: "John 3:16", href: "https://www.esv.org/John+3:16/" },
        ],
    },
];

export function paragraphText(paragraph: Paragraph): string {
    if (typeof paragraph === "string") {
        return paragraph;
    }
    return paragraph.map((part) => typeof part === "string" ? part : part.text).join("");
}
