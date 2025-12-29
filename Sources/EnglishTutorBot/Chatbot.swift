import Foundation

struct LessonTip {
    let title: String
    let detail: String
    let example: String
}

struct VocabularyEntry {
    let word: String
    let meaning: String
    let example: String
    let synonyms: [String]
}

struct PracticeQuestion {
    let prompt: String
    let expectedAnswer: String
    let hint: String
}

/// A lightweight, rule-based chatbot focused on helping learners practice English.
final class EnglishTutorBot {
    private let tips: [LessonTip]
    private let vocabulary: [VocabularyEntry]
    private let grammarLessons: [String: String]
    private let practiceQuestions: [PracticeQuestion]

    private var queuedQuestion: PracticeQuestion?
    private var questionIndex: Int = 0

    init() {
        tips = [
            LessonTip(
                title: "Shadow native speakers",
                detail: "Listen to a short clip, then repeat it aloud. Focus on intonation and chunking phrases rather than individual words.",
                example: "Try shadowing the phrase: 'I didn’t catch that—could you say it again?'"
            ),
            LessonTip(
                title: "Upgrade simple verbs",
                detail: "Replace basic verbs like 'get' or 'do' with precise alternatives to sound more natural.",
                example: "Instead of 'get better', try 'improve'. Instead of 'do exercise', try 'work out'."
            ),
            LessonTip(
                title: "Use time markers",
                detail: "Words like 'already', 'yet', 'still', and 'just' clarify when actions happen and pair well with perfect tenses.",
                example: "'I’ve already eaten, but I’m still hungry.'"
            )
        ]

        vocabulary = [
            VocabularyEntry(
                word: "concise",
                meaning: "Expressing something clearly in a few words.",
                example: "Your email was concise and easy to follow.",
                synonyms: ["brief", "succinct", "to the point"]
            ),
            VocabularyEntry(
                word: "nuance",
                meaning: "A subtle difference in meaning, sound, or feeling.",
                example: "He explained the nuance between 'listen' and 'hear'.",
                synonyms: ["subtlety", "shade", "distinction"]
            ),
            VocabularyEntry(
                word: "reliable",
                meaning: "Consistently good in quality or performance; dependable.",
                example: "She is a reliable teammate who meets every deadline.",
                synonyms: ["dependable", "trustworthy", "steady"]
            ),
            VocabularyEntry(
                word: "curious",
                meaning: "Eager to learn or know something.",
                example: "Stay curious and ask why native speakers use certain phrases.",
                synonyms: ["inquisitive", "interested", "eager"]
            )
        ]

        grammarLessons = [
            "present perfect": "Use it to connect past actions with the present. Structure: have/has + past participle (e.g., 'I have visited London twice.').",
            "conditionals": "Zero: facts (If you heat ice, it melts). First: likely future (If it rains, we’ll stay in). Second: unreal present (If I had time, I would travel). Third: unreal past (If I had studied, I would have passed).",
            "phrasal verbs": "Combine verbs with particles (look up, run into). The meaning often changes, so learn them in context with an object (e.g., 'look up a word').",
            "articles": "Use 'a/an' for non-specific singular nouns, 'the' for specific items or when both speaker and listener know the reference. Zero article with plural or uncountable nouns when speaking generally.",
            "prepositions": "'In' for months/years/long periods, 'on' for days/dates, 'at' for precise times/locations. Check collocations: 'interested in', 'good at'."
        ]

        practiceQuestions = [
            PracticeQuestion(
                prompt: "Rewrite in natural English: 'I go to gym yesterday.'",
                expectedAnswer: "I went to the gym yesterday.",
                hint: "Use past tense and include an article before 'gym'."
            ),
            PracticeQuestion(
                prompt: "Respond politely: Someone says 'Could you help me move this table?'",
                expectedAnswer: "Sure, I’d be happy to help.",
                hint: "Start with a friendly confirmation and keep it short."
            ),
            PracticeQuestion(
                prompt: "Choose the best option: 'I have lived / lived in Paris since 2019.'",
                expectedAnswer: "I have lived in Paris since 2019.",
                hint: "Use the perfect tense to connect past and present."
            )
        ]
    }

    func greeting() -> String {
        "Hello! I’m your English study buddy. Ask me to explain grammar, check a sentence, or say 'quiz' for practice. Type 'help' to see options or 'exit' to finish."
    }

    func reply(to userInput: String) -> String {
        let trimmed = userInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return "Try telling me what you want: grammar help, a vocabulary word, or a practice question."
        }

        let lowercased = trimmed.lowercased()

        if lowercased == "help" {
            return helpMessage()
        }

        if lowercased == "exit" {
            return "Great work today. Keep practicing, and come back anytime!"
        }

        if let queuedQuestion {
            return evaluatePracticeResponse(for: queuedQuestion, userAnswer: trimmed)
        }

        if lowercased.contains("quiz") || lowercased.contains("practice") || lowercased.contains("question") {
            return nextPracticePrompt()
        }

        if lowercased.contains("tip") || lowercased.contains("advice") {
            return formatTip()
        }

        if let word = extractWordForDefinition(from: lowercased), let entry = findVocabularyMatch(for: word) {
            return formatVocabularyEntry(entry)
        }

        if lowercased.contains("check") || lowercased.contains("correct") || lowercased.contains("fix") {
            return assessSentenceQuality(trimmed)
        }

        if let lesson = grammarLesson(for: lowercased) {
            return lesson
        }

        return supportiveResponse(for: trimmed)
    }

    func assessSentenceQuality(_ sentence: String) -> String {
        var suggestions: [String] = []

        if let first = sentence.first, !first.isUppercase {
            suggestions.append("Capitalize the first word: \(sentence.prefix(while: { !$0.isWhitespace })) → \(sentence.prefix(while: { !$0.isWhitespace }).capitalized)")
        }

        if !sentence.hasSuffix(".") && !sentence.hasSuffix("!") && !sentence.hasSuffix("?") {
            suggestions.append("Add ending punctuation to show sentence completion (., !, or ?).")
        }

        if sentence.contains("  ") {
            suggestions.append("Reduce extra spaces so the sentence reads smoothly.")
        }

        let lower = sentence.lowercased()
        if lower.contains("yesterday") && lower.contains(" go ") {
            suggestions.append("Use the simple past after time markers like 'yesterday': try 'went'.")
        }

        if lower.contains("i am wanting") {
            suggestions.append("Use 'want' instead of 'am wanting' for states: 'I want'.")
        }

        if suggestions.isEmpty {
            return "Looks good! Try reading it aloud to check rhythm and stress."
        }

        let bulletList = suggestions.map { "• \($0)" }.joined(separator: "\n")
        return "Here are some quick fixes:\n\(bulletList)"
    }

    // MARK: - Private helpers

    private func helpMessage() -> String {
        "Commands: 'quiz' for a question, 'tip' for a study idea, 'check: <sentence>' for feedback, or ask about grammar topics like conditionals or articles."
    }

    private func formatTip() -> String {
        let tip = tips[questionIndex % tips.count]
        return "Tip — \(tip.title): \(tip.detail) Example: \(tip.example)"
    }

    private func nextPracticePrompt() -> String {
        let question = practiceQuestions[questionIndex % practiceQuestions.count]
        questionIndex += 1
        queuedQuestion = question
        return "Practice: \(question.prompt) (Type your answer, or 'hint'/'skip')"
    }

    private func evaluatePracticeResponse(for question: PracticeQuestion, userAnswer: String) -> String {
        let cleanedAnswer = userAnswer.trimmingCharacters(in: .whitespacesAndNewlines)
        let lowerAnswer = cleanedAnswer.lowercased()

        if lowerAnswer == "hint" {
            return "Hint: \(question.hint)"
        }

        if lowerAnswer == "skip" {
            queuedQuestion = nil
            return "No problem. A natural answer is: \(question.expectedAnswer)"
        }

        let expectedLower = question.expectedAnswer.lowercased()
        if lowerAnswer == expectedLower || lowerAnswer.contains(expectedLower) {
            queuedQuestion = nil
            return "Great job! That sounds natural. Want another quiz?"
        }

        return "Not quite. Check tense and word order. Type 'hint' for help or 'skip' to see an example."
    }

    private func extractWordForDefinition(from input: String) -> String? {
        let tokens = input
            .replacingOccurrences(of: "?", with: "")
            .replacingOccurrences(of: "meaning of", with: "")
            .replacingOccurrences(of: "define", with: "")
            .replacingOccurrences(of: "what does", with: "")
            .components(separatedBy: CharacterSet.whitespaces)
            .filter { !$0.isEmpty }

        return tokens.last
    }

    private func findVocabularyMatch(for word: String) -> VocabularyEntry? {
        vocabulary.first { entry in
            entry.word == word || entry.synonyms.contains(where: { $0 == word })
        }
    }

    private func formatVocabularyEntry(_ entry: VocabularyEntry) -> String {
        let synonymList = entry.synonyms.joined(separator: ", ")
        return "\(entry.word.capitalized): \(entry.meaning) Example: \(entry.example) Synonyms: \(synonymList)."
    }

    private func grammarLesson(for input: String) -> String? {
        for (topic, lesson) in grammarLessons {
            if input.contains(topic) {
                return "Grammar — \(topic.capitalized): \(lesson)"
            }
        }
        return nil
    }

    private func supportiveResponse(for message: String) -> String {
        let starters = [
            "Nice question! Here's a more natural way to say it:",
            "Let's polish that sentence:",
            "Great effort! Try this phrasing:",
            "To sound more fluent, you could say:"
        ]

        let opener = starters[questionIndex % starters.count]
        questionIndex += 1

        let improved = rewriteSentence(message)
        return "\(opener) \(improved)"
    }

    private func rewriteSentence(_ sentence: String) -> String {
        let trimmed = sentence.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return "Let's build a sentence together about your day." }

        if trimmed.count < 4 {
            return "Can you share a longer idea? For example: 'I want to improve my pronunciation.'"
        }

        var suggestion = trimmed

        if !trimmed.hasSuffix(".") && !trimmed.hasSuffix("!") && !trimmed.hasSuffix("?") {
            suggestion += "."
        }

        if let first = suggestion.first {
            let capitalizedFirst = String(first).uppercased()
            suggestion.replaceSubrange(suggestion.startIndex...suggestion.startIndex, with: capitalizedFirst)
        }

        if suggestion.lowercased().hasPrefix("i want learn") {
            suggestion = suggestion.replacingOccurrences(of: "I want learn", with: "I want to learn")
        }

        if suggestion.lowercased().hasPrefix("i go") && suggestion.lowercased().contains("yesterday") {
            suggestion = suggestion.replacingOccurrences(of: "I go", with: "I went")
        }

        return suggestion
    }
}
