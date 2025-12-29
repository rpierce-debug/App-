// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "EnglishTutorBot",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "EnglishTutorBot",
            targets: ["EnglishTutorBot"]
        )
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "EnglishTutorBot",
            dependencies: []
        ),
        .testTarget(
            name: "EnglishTutorBotTests",
            dependencies: ["EnglishTutorBot"]
        )
    ]
)
