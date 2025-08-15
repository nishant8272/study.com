import React from "react";

function Footer() {
  return (
    <>
      <footer  />
      <div className="bg-[#005748] text-white py-6 bottom-0 w-full">
        <div className="flex items-center flex-col max-w-4xl w-full mx-auto">
          <div className="flex gap-6 mb-2">
            <a href="https://www.linkedin.com/in/nishant-verma-57a1b0328/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="block">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" className="block h-6" />
            </a>
            <a href="https://twitter.com/nishantverma127" target="_blank" rel="noopener noreferrer" title="Twitter" className="block">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg" alt="Twitter" className="block h-6" />
            </a>
            <a href="https://github.com/nishant8272" target="_blank" rel="noopener noreferrer" title="GitHub" className="block">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="block bg-white rounded-full h-6 p-0.5" />
            </a>
          </div>
          <p className="text-xs leading-4">
            <span>&copy; </span>
            <span>2025</span>
            <span> Study.com. All rights reserved.</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Footer;
