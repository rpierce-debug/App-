import XCTest
@testable import EnglishTutorBot

final class EnglishTutorBotTests: XCTestCase {
    func testGivesTip() {
        let bot = EnglishTutorBot()
        let response = bot.reply(to: "Give me a tip")
        XCTAssertTrue(response.contains("Tip"), "Expected a study tip in response")
    }

    func testPracticeFlowAcceptsCorrectAnswer() {
        let bot = EnglishTutorBot()
        _ = bot.reply(to: "quiz")
        let feedback = bot.reply(to: "I went to the gym yesterday.")
        XCTAssertTrue(feedback.lowercased().contains("great job"))
    }

    func testAssessSentenceQualityHighlightsPastTense() {
        let bot = EnglishTutorBot()
        let feedback = bot.assessSentenceQuality("i go to gym yesterday")
        XCTAssertTrue(feedback.contains("Capitalize"))
        XCTAssertTrue(feedback.contains("past"))
    }
}
