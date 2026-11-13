export default function HillWave({ className }: { className?: string }) {
    return (
        <svg
            className={className ? `hill-wave ${className}` : "hill-wave"}
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M0 72 C240 18 480 84 760 44 C960 16 1160 22 1300 40 C1370 49 1410 56 1440 58 L1440 90 L0 90 Z" />
        </svg>
    );
}
