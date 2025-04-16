import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ScrollShadow,
  Spacer,
  Tooltip,
  useDisclosure
} from "@nextui-org/react";

interface ManageSubscriptionIframe {
  url: string;
  trigger: boolean;
  setTriggerIframe: React.Dispatch<React.SetStateAction<boolean>>;
}
const IframeModule: React.FC<{ url: string }> = ({ url }) => {
  console.log(url, "url");
  return (
    <iframe
      src={url}
      tabIndex={0}
      title="Embedded Website"
      style={{
        width: "100%",
        height: "600px",
        border: "none",
      }}
      onLoad={(e) => {
        const iframe = e.target as HTMLIFrameElement;
        try {
          iframe.contentWindow?.focus();
        } catch (error) {
          console.warn("Unable to focus iframe:", error);
        }
      }}
    />
  );
};

const IframeComponent: React.FC<ManageSubscriptionIframe> = ({ url, trigger, setTriggerIframe}) => {
  const { isOpen, onOpen, onOpenChange,onClose } = useDisclosure();
  const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);


  useEffect(() => {
    if (trigger) {
      onOpen(); // Open modal if triggerModal is true
    }
  }, [trigger, onOpen]);

  const handleClose = () => {
    onClose();
    setTriggerIframe(false); // Set triggerIframe back to false when modal is closed
  };

  return (
    <div >
 
      <Modal isOpen={isOpen} onClose={handleClose} onOpenChange={onOpenChange} backdrop="blur" style={{ width: '1000px' }}>
        <ModalContent className="w-[600px] h-auto max-w-full" >
          {(onClose) => (
            <>
              <ModalBody>
                <h2 className="text-[24px] leading-3 mt-8 text-black font-semibold">
                  Manage Subscription
                </h2>
              

                <IframeModule url={url}/>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default IframeComponent;
