import React, { useEffect } from "react";

// css
import "../../Css/PrivacyTerms.css";

// component
import Navbar from "../Navbar";
import MainFooter from "../Footer/MainFooter";
import TermFooter from "../Footer/TermFooter";

const PrivacyPolicy = () => {
  // scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />

      <div className="privacy__terms">
        <h1>Privacy Policy of Kabadi Techno Pvt. Ltd.</h1>
        <div className="privacy__terms__section">
          <p>
            Kabadi Techno operates <span>http://www.kabaditechno.com/</span>{" "}
            website, which provides the services.
          </p>
          <p>
            This page is used to inform website visitors regarding our policies
            with the collection, use, and disclosure of Personal Information if
            anyone decided to use our service,{" "}
            <span>http://www. kabaditechno.com/</span> website.
          </p>
          <p>
            If you choose to use our service, then you agree to the collection
            and use of information in relation with this policy. The Personal
            Information that we collect are used for providing and improving the
            service. We will not use or share your information with anyone
            except as described in this Privacy Policy.
          </p>
          <h1>Information Collection and Use</h1>
          <p>
            For a better experience while using our service, we may require you
            to provide us with certain personally identifiable information,
            including but not limited to your name, phone number, email address
            and postal address. The information that we collect will be used to
            contact or identify you.
          </p>
          <h1>Log Data</h1>
          <p>
            We want to inform you that whenever you visit our service, we
            collect information that your browser sends to us that is called Log
            Data. This Log Data may include information such as your computer's
            Internet Protocol (“IP”) address, browser version, pages of our
            service that you visit, the time and date of your visit, the time
            spent on those pages, and other statistics.
          </p>
          <h1>Cookies</h1>
          <p>
            Cookies are files with small amount of data that is commonly used an
            anonymous unique identifier. These are sent to your browser from the
            website that you visit and are stored on your computer's hard drive.
            Our website uses these “cookies” to collection information and to
            improve our service. You have the option to either accept or refuse
            these cookies, and know when a cookie is being sent to your
            computer. If you choose to refuse our cookies, you may not be able
            to use some portions of our service.
          </p>
          <h1>Service Providers</h1>
          <p>
            We may employ third-party companies and individuals due to the
            following reasons:
          </p>
          <ul>
            <li>To facilitate our service;</li>
            <li>To provide the service on our behalf;</li>
            <li>To perform service-related services or</li>
            <li>To assist us in analyzing how our service is used.</li>
          </ul>
          <p>
            We want to inform our service users that these third parties have
            access to your Personal Information. The reason is to perform the
            tasks assigned to them on our behalf. However, they are obligated
            not to disclose or use the information for any other purpose and in
            any case if the Third Party without our information discloses any
            information of our service users than for that the sole party liable
            would be the defrauding party.
          </p>
          <h1>Security</h1>
          <p>
            We value your trust in providing us your Personal Information, thus
            we are striving to use commercially acceptable means of protecting
            it. But do note that no method of transmission over the internet, or
            method of electronic storage is 100% secure and reliable, and we
            cannot guarantee its absolute security.
          </p>
          <h1>Links to Other Sites</h1>
          <p>
            Our service may contain links to other sites. If you click on a
            third-party link, you will be directed to that site. Note that these
            external sites are not operated by us. Therefore, we strongly advise
            you to review the Privacy Policy of these websites. We have no
            control over, and assume no responsibility for the content, privacy
            policies, or practices of any third-party sites or services.
          </p>
          <h1>Children's Privacy</h1>
          <p>
            Our services do not address anyone under the age of 18. We do not
            knowingly collect personal identifiable information from children
            under 18. In the case we discover that a child under 18 has provided
            us with personal information, we immediately delete this from our
            servers. If you are a parent or guardian and you are aware that your
            child has provided us with personal information, please contact us
            so that we will be able to do necessary actions.
          </p>
          <h1>Changes to This Privacy Policy</h1>
          <p>
            We may update our Privacy Policy from time to time. Thus, we advise
            you to review this page periodically for any changes. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            These changes are effective immediately, after they are posted on
            this page.
          </p>
          <h1>Contact Us</h1>
          <p>
            If you have any questions or suggestions about our Privacy Policy,
            do not hesitate to contact us.
          </p>
        </div>
        <span>© 2018-2021 Kabadi Techno Pvt. Ltd.- All Rights Reserved.</span>
      </div>

      <MainFooter />

      <TermFooter />
    </>
  );
};

export default PrivacyPolicy;
