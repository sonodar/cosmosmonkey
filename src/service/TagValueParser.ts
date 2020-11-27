// var keyValuesPattern = regexp.MustCompile(`(?:([^,=\s]+)?\s*=\s*([^,\s]+))`)
// var startStopTimePattern = regexp.MustCompile(`^([\-+]\d{4}),(\d+:\d+)-(\d+:\d+)$`)
//
// func ToInt64P(value string) *int64 {
// 	if num, err := strconv.ParseInt(value, 10, 64); err != nil {
// 		return nil
// 	} else {
// 		return &num
// 	}
// }
//
// func ParseKeyValues(value string) map[string]string {
// 	results := map[string]string{}
// 	matches := keyValuesPattern.FindAllStringSubmatch(value, -1)
// 	for _, match := range matches {
// 		results[match[1]] = match[2]
// 	}
// 	return results
// }
//
// func ParseStartStopTime(value string) (*time.StartStopTime, error) {
// 	if !startStopTimePattern.MatchString(value) {
// 		return nil, errors.New(fmt.Sprintf("'%s' is invalid Start/Stop Time", value))
// 	}
// 	matches := startStopTimePattern.FindStringSubmatch(value)
// 	stopAt := string(matches[3])
// 	startAt := string(matches[2])
// 	offset := string(matches[1])
// 	startStopTime, err := time.NewStartStopTime(offset, startAt, stopAt)
// 	if err != nil {
// 		return nil, errors.New(fmt.Sprintf("'%s' is invalid Start/Stop Time, %v", value, err))
// 	}
// 	return startStopTime, nil
// }
import { StartStopTime, Time } from 'models'

export type TagValue = {
	startStopTime: StartStopTime
	config: Record<string, string>
}

export class TagValueParser {
	public static parse(value: string): TagValue | null {
		const ret = parseValue(value)
		if (!ret) {
			console.warn('invalid tag value:', value)
			return null
		}
		const { offset, startAt, stopAt, config } = ret
		try {
			const startStopTime = new StartStopTime(parseInt(offset), Time.parse(startAt), Time.parse(stopAt))
			return { startStopTime, config }
		} catch (e) {
			console.error(e.message)
			return null
		}
	}
}

function parseValue(value: string) {
	const matcher = /^([-+]\d{3,4}),(\d{1,2}:\d{1,2})-(\d{1,2}:\d{1,2})/.exec(value)
	if (!matcher) return null
	const [, offset, startAt, stopAt] = Array.from(matcher)
	const config = getConfig(value)
	return { offset, startAt, stopAt, config }
}

function getConfig(value: string): Record<string, string> {
	const config: Record<string, string> = {}
	const pattern = /(?:([^,=\s]+)?\s*=\s*([^,\s]+))/g
	let matcher = null
	while ((matcher = pattern.exec(value))) {
		const [, name, value] = Array.from(matcher)
		config[name] = value
	}
	return config
}
