import { Time } from 'models'

describe(Time, () => {
  describe('toString', () => {
    it('HH:mm:ssの形式を返すこと', () => {
      const time = new Time(9, 0)
      expect(time.toString()).toEqual('09:00:00')
    })
  })

  describe('parse', () => {
    it('HH:mm形式の文字列から生成できること', () => {
      const time = Time.parse('09:45')
      expect(time.hour).toEqual(9)
      expect(time.minute).toEqual(45)
    })

    it('HH:mm以外の形式の文字列はエラーになること', () => {
      expect(() => Time.parse('0945')).toThrowError('Invalid time format, expected format is "HH:mm", but "0945"')
    })
  })
})
