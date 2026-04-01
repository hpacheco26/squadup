import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import useLanguageStore from '../store/languageStore';

function TermsOfServicePage() {
    const navigate = useNavigate();
    const { t } = useLanguageStore();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
            }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    <IoIosArrowBack size={24} />
                </button>
                <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {t('termsOfService')}
                </h1>
                <div style={{ width: '34px' }} />
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', lineHeight: '1.7', color: '#334155', fontSize: '0.92rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '16px' }}>
                    {t('lastUpdated')}: April 2026
                </p>

                <Section title={t('tosAcceptanceTitle')}>
                    {t('tosAcceptanceBody')}
                </Section>

                <Section title={t('tosUseTitle')}>
                    {t('tosUseBody')}
                </Section>

                <Section title={t('tosAccountsTitle')}>
                    {t('tosAccountsBody')}
                </Section>

                <Section title={t('tosContentTitle')}>
                    {t('tosContentBody')}
                </Section>

                <Section title={t('tosTerminationTitle')}>
                    {t('tosTerminationBody')}
                </Section>

                <Section title={t('tosLiabilityTitle')}>
                    {t('tosLiabilityBody')}
                </Section>

                <Section title={t('tosChangesTitle')}>
                    {t('tosChangesBody')}
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{children}</p>
        </div>
    );
}

export default TermsOfServicePage;
