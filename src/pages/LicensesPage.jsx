import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import useLanguageStore from '../store/languageStore';

const licenses = [
    { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
    { name: 'React DOM', license: 'MIT', url: 'https://github.com/facebook/react' },
    { name: 'React Router', license: 'MIT', url: 'https://github.com/remix-run/react-router' },
    { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
    { name: 'Firebase JS SDK', license: 'Apache-2.0', url: 'https://github.com/firebase/firebase-js-sdk' },
    { name: 'Vite', license: 'MIT', url: 'https://github.com/vitejs/vite' },
    { name: 'Bulma', license: 'MIT', url: 'https://github.com/jgthms/bulma' },
    { name: 'Framer Motion', license: 'MIT', url: 'https://github.com/framer/motion' },
    { name: 'Swiper', license: 'MIT', url: 'https://github.com/nolimits4web/swiper' },
    { name: 'Lucide React', license: 'ISC', url: 'https://github.com/lucide-icons/lucide' },
    { name: 'React Icons', license: 'MIT', url: 'https://github.com/react-icons/react-icons' },
    { name: 'Font Awesome', license: 'MIT / CC BY 4.0', url: 'https://github.com/FortAwesome/Font-Awesome' },
    { name: 'Canvas Confetti', license: 'ISC', url: 'https://github.com/catdad/canvas-confetti' },
    { name: 'Capacitor', license: 'MIT', url: 'https://github.com/ionic-team/capacitor' },
    { name: 'Orbitron Font', license: 'OFL', url: 'https://fonts.google.com/specimen/Orbitron' },
    { name: 'Racing Sans One Font', license: 'OFL', url: 'https://fonts.google.com/specimen/Racing+Sans+One' },
];

function LicensesPage() {
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
                    {t('openSourceLicenses')}
                </h1>
                <div style={{ width: '34px' }} />
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.6' }}>
                    {t('licensesIntro')}
                </p>
                {licenses.map((lib) => (
                    <div key={lib.name} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 0', borderBottom: '1px solid #f1f5f9',
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '0.92rem', color: '#0f172a' }}>{lib.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{lib.license}</div>
                        </div>
                        <a
                            href={lib.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.8rem', color: '#5b7bb3', textDecoration: 'none', fontWeight: '500' }}
                        >
                            {t('viewSource')}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LicensesPage;
