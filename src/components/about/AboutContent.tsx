interface AboutContentProps {
    paragraphs: string[];
}

export const AboutContent = ({ paragraphs }: AboutContentProps) => {
    return (
        <div className="flex flex-col gap-4 tracking-tighter leading-7 text-sm font-medium text-slate-800">
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
        </div>
    );
};
