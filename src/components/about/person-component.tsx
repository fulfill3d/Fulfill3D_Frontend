import React from 'react';
import ImagePlaceholder from "@/svg/image-placeholder";
import SocialMediaIcon from "@/components/about/social-media-icon";
import {useGetPersonProfile} from "@/hooks/feature/use-get-person-profile";
import Loading from "@/app/loading";
import ErrorPage from "@/app/error";
import ImageWithLoader from "@/components/common/image-with-loader";

interface PersonProps {
}

const PersonComponent: React.FC<PersonProps> = () => {
    const { profile, loading, error } = useGetPersonProfile();

    if (loading || !profile) return <Loading />;

    if (error) return (<ErrorPage error={new Error(error || "Unknown error")} reset={() => window.location.reload()}/>);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex flex-col items-center text-center">
                {/* Image */}
                <div className="relative w-32 h-32 mb-4">
                    <ImageWithLoader
                        src={profile.imageUrl}
                        alt={profile.name}
                        placeholderSrc={ImagePlaceholder}
                        className="rounded-full"
                    />
                </div>


                {/* Name and Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{profile.name}</h2>
                <h3 className="text-lg text-gray-600 mb-4">{profile.title}</h3>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed mb-4">{profile.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                    {profile.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded"
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
                            <SocialMediaIcon platform={social.platform}/>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonComponent;
