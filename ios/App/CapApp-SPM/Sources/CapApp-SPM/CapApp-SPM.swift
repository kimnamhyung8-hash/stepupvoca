import SpeechRecognitionPlugin
import TextToSpeechPlugin

// Capacitor 8 SPM: 플러그인을 명시적으로 참조하여 링커 제거(Dead-code stripping)를 방지합니다.
// 이 파일이 없으면 "plugin is not implemented on ios" 오류가 발생합니다.
public let isCapacitorApp = true
public let speechRecognitionPlugin: AnyClass = SpeechRecognition.self
public let textToSpeechPlugin: AnyClass = TextToSpeechPlugin.self
