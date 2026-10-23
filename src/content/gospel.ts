type GospelSection = {
    id: string;
    heading: string;
    paragraphs: string[];
    quote?: {
        text: string;
        author: string;
        source: string;
        href: string;
    };
    afterQuote?: string[];
    references: { label: string; href: string }[];
};

export const gospelIntroduction = "The gospel is the good news of the kingdom of God. Jesus came to announce God’s reign and call people to repent, believe, and follow Him. I have come to understand my relationship with God through this big picture: following Jesus together, loving our neighbors, and caring for the world He created.";

export const gospelSections: GospelSection[] = [
    {
        id: "gods-kingdom",
        heading: "God’s kingdom",
        paragraphs: [
            "In Mark 1:15, Jesus declares that God’s kingdom is at hand and calls people to repent and believe in the gospel. This is central to understanding what Jesus came to do.",
            "What is the kingdom of God? It is God’s reign, His good and rightful rule over His creation. In Jesus, this reign has come near. He calls us to turn towards God and live according to His word, the Bible.",
        ],
        references: [
            { label: "Mark 1:14-15", href: "https://www.esv.org/Mark+1:14-15/" },
        ],
    },
    {
        id: "made-to-know-god",
        heading: "Made to know God",
        paragraphs: [
            "First, who is God? He is our perfect, loving, and just Creator. We exist because God desired us, and He made us to know Him, love Him, and love one another. Our relationship with Him was intended to be this way from the very beginning.",
        ],
        quote: {
            text: "The chief end of man is to glorify God by enjoying Him forever.",
            author: "John Piper",
            source: "Christian Hedonism",
            href: "https://www.desiringgod.org/articles/christian-hedonism",
        },
        afterQuote: [
            "By ‘chief end,’ Piper means our ultimate purpose. Glorifying God and finding our deepest satisfaction in Him belong together, and loving God means learning to love the people He created. So what has gone wrong with the way we live?",
        ],
        references: [
            { label: "Matthew 22:37-40", href: "https://www.esv.org/Matthew+22:37-40/" },
        ],
    },
    {
        id: "god-and-us",
        heading: "Dead in sin",
        paragraphs: [
            "The Bible calls the problem sin. Sin is anything we think, say, or do that goes against God’s law and grieves His heart. In other words, it is failure to love God or love our neighbor as we ought. Every one of us has sinned. We have turned away from the God who made us and chosen to live on our own terms. This rebellion harms our relationships and communities. We see its effects in greed, exploitation, injustice, and the suffering we cause one another.",
            "Because God is just, He must deal with sin. Love does not mean pretending evil is harmless; our sin makes us guilty before Him, and its punishment is death. When the Bible says we are dead in our sins, it describes our separation from God and our inability to restore this relationship ourselves. We need forgiveness and new life.",
            "So how can a just God forgive us?",
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
            "God sent His only Son, Jesus Christ. Jesus is fully God in His divine nature, and fully man in His human nature. He came into our world and loved God and others perfectly. Because He is truly human, He can stand in our place. Because He is God, He reveals God to us and has the power to give us life.",
            "Jesus also showed what God’s reign looks like. He healed the sick, freed people from evil, welcomed those who were pushed aside, and called sinners to repentance. Through His words and actions, we see God’s love for us and learn how He calls us to love one another. This same love led Him to give His life for us on the cross.",
        ],
        references: [
            { label: "John 1:1-14", href: "https://www.esv.org/John+1:1-14/" },
            { label: "Luke 4:18-21", href: "https://www.esv.org/Luke+4:18-21/" },
            { label: "Luke 11:20", href: "https://www.esv.org/Luke+11:20/" },
        ],
    },
    {
        id: "the-cross-and-resurrection",
        heading: "Death and resurrection",
        paragraphs: [
            "Jesus lived the life we should have lived and died the death our sin deserved. Though He had no sin of His own, He willingly gave His life and shed His blood so that we could be forgiven and reconciled to God. On the cross, God’s justice is satisfied and His mercy is offered to us.",
            "On the third day, Jesus rose from the dead. Death no longer has dominion over Him. The One who promises us eternal life is Himself alive. The kingdom He announced has a living King.",
        ],
        references: [
            { label: "2 Corinthians 5:21", href: "https://www.esv.org/2+Corinthians+5:21/" },
            { label: "1 Corinthians 15:3-8", href: "https://www.esv.org/1+Corinthians+15:3-8/" },
            { label: "Romans 6:9", href: "https://www.esv.org/Romans+6:9/" },
        ],
    },
    {
        id: "new-life",
        heading: "Alive in Christ",
        paragraphs: [
            "So how do we receive this life? Salvation is deliverance from sin, a free gift of God received by grace through faith in Jesus Christ. Grace means that God saves us out of His kindness, not because we have earned it. Faith means trusting Jesus and what He has done for us. Repentance means turning away from sin and towards God.",
            "God makes us alive in Christ, and by the Holy Spirit, He changes our hearts so that we can walk in His ways. We become part of God’s family, learning to follow Jesus and put His teachings into practice. Obedience is our response to His love, not the price of His forgiveness. We love because He first loved us.",
        ],
        references: [
            { label: "Ephesians 2:1-10", href: "https://www.esv.org/Ephesians+2:1-10/" },
            { label: "1 John 4:19", href: "https://www.esv.org/1+John+4:19/" },
            { label: "1 John 5:3", href: "https://www.esv.org/1+John+5:3/" },
        ],
    },
    {
        id: "living-in-his-kingdom",
        heading: "Living as His people",
        paragraphs: [
            "So how should we live? In Matthew 28:19-20, Jesus sends His followers to make disciples of all nations, baptizing them and teaching them to obey everything He commanded. We are called to share the gospel, help others come to know Him, and equip them to teach and encourage others in turn.",
            "This calling reaches into everyday life. Following Jesus means learning to love our neighbors, care for those who are suffering, and respond to the injustice around us. We pray for God’s kingdom to come and seek to reflect what Jesus teaches in how we live and help others follow Him.",
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
            "Since being saved by grace through faith in Jesus Christ, I have tasted and seen that His grace is sufficient. I can testify that nothing in this world can satisfy nearly as much as God’s love for me. Though it hasn’t been easy, I have found everlasting joy as God continues to change my heart by the Holy Spirit’s power.",
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
            "John 3:16 tells us that God loved the world so much that He gave His only Son, Jesus Christ, so that whoever believes in Him will have eternal life.",
            "If you don’t know Jesus as Lord and Savior, I invite you to come to Him. Turn away from your sin, put your faith in Jesus, and receive the life He offers. You don’t need to have every question answered before taking this step. Come to know Him, grow in His love, and share this love with others.",
        ],
        references: [
            { label: "John 3:16", href: "https://www.esv.org/John+3:16/" },
        ],
    },
];
