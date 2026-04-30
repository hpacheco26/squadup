import { describe, it, expect } from 'vitest';
import { t, getTranslation } from '../../src/i18n';

describe('getTranslation', () => {
    it('returns the requested language dictionary', () => {
        expect(getTranslation('en')).toBeTypeOf('object');
        expect(getTranslation('pt')).toBeTypeOf('object');
    });

    it('falls back to English for unknown languages', () => {
        expect(getTranslation('xx')).toBe(getTranslation('en'));
    });
});

describe('t()', () => {
    it('returns the translation in the requested language', () => {
        expect(t('en', 'squadUp')).toBe('Squad Up');
        expect(t('pt', 'squadUp')).toBe('Squad Up');
    });

    it('falls back to English when the key is missing in the target language', () => {
        // Using a guaranteed-existing English key with an unknown lang.
        expect(t('xx', 'squadUp')).toBe('Squad Up');
    });

    it('returns the key itself when the key is missing in BOTH languages', () => {
        expect(t('en', '__missing_key_for_test__')).toBe('__missing_key_for_test__');
    });

    it('substitutes single parameters', () => {
        expect(t('en', 'joinSquadMessage', { group: 'Wolves' })).toContain('Wolves');
    });

    it('leaves un-supplied parameters in place', () => {
        const result = t('en', 'joinSquadMessage', {}); // no `group`
        expect(result).toContain('{group}');
    });
});
