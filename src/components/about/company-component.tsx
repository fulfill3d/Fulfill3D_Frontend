import React from 'react';
import ImagePlaceholder from "@/svg/image-placeholder";
import SocialMediaIcon from "@/components/about/social-media-icon";
import {useGetCompanyProfile} from "@/hooks/feature/use-get-company-profile";
import Loading from "@/app/loading";
import ErrorPage from "@/app/error";
import ImageWithLoader from "@/components/common/image-with-loader";

interface CompanyProps {
}

const CompanyComponent: React.FC<CompanyProps> = () => {
    const { profile, loading, error } = useGetCompanyProfile();

    if (loading || !profile) return <Loading />;

    if (error) return (<ErrorPage error={new Error(error || "Unknown error")} reset={() => window.location.reload()}/>);

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 overflow-hidden">
            {/* Company Logo */}
            <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
                    <ImageWithLoader
                        src={profile.logoUrl}
                        alt={profile.companyName}
                        placeholderSrc={ImagePlaceholder}
                        className="rounded-lg"
                    />
                </div>
            </div>

            {/* Company Name and Mission */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4 break-words">
                {profile.companyName}
            </h2>
            <p className="text-base md:text-lg text-gray-600 text-center mb-4 italic break-words">
                {profile.mission}
            </p>

            {/* Description */}
            <div className="flex flex-wrap gap-2 pb-6 justify-center">
                {profile.descriptions.map((description, index) => (
                    <p
                        key={index}
                        className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 text-center break-words"
                    >
                        {description}
                    </p>
                ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center">
                {profile.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="bg-gray-200 text-gray-800 text-xs md:text-sm font-semibold px-2 py-0.5 rounded"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-4 mt-4">
                {profile.socialMedia.map((social, index) => (
                    <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                    >
                        <SocialMediaIcon platform={social.platform} />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default CompanyComponent;
