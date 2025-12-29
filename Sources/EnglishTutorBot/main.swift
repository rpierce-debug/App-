import Foundation

let bot = EnglishTutorBot()

print(bot.greeting())

while true {
    print("\nYou: ", terminator: "")
    guard let input = readLine() else {
        print("Goodbye!")
        break
    }

    let response = bot.reply(to: input)
    print("Tutor: \(response)")

    if input.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) == "exit" {
        break
    }
}
