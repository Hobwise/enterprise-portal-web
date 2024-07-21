'use client';

import { createTermsAndCondition } from '@/app/api/controllers/dashboard/settings';
import { CustomButton } from '@/components/customButton';
import useTermsAndCondition from '@/hooks/cachedEndpoints/useTermsAndConditions';
import { getJsonItemFromLocalStorage, notify } from '@/lib/utils';
import {
  Code,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  useDisclosure,
} from '@nextui-org/react';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Success from '../../../../../public/assets/images/success.png';

const TermsCondition = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data, refetch } = useTermsAndCondition(true);

  const [isOpenPreview, setIsOpenPreview] = useState(false);

  const business = getJsonItemFromLocalStorage('business');
  const [isSavingToDraft, setIsSavingToDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const togglePreview = () => {
    setIsOpenPreview(!isOpenPreview);
  };

  const onEditorStateChange = (editorState: EditorState) => {
    setEditorState(editorState);
  };

  const getEditorContent = () => {
    const contentState = editorState.getCurrentContent();
    return JSON.stringify(convertToRaw(contentState));
  };

  const submitFormData = async (
    e: { preventDefault: () => void },
    isPublished: boolean
  ) => {
    e.preventDefault();
    const editorText = getEditorContent();

    const payload = {
      content: editorText,
      isPublished: isPublished,
    };

    if (isPublished) {
      setIsPublishing(true);
    } else {
      setIsSavingToDraft(true);
    }
    const data = await createTermsAndCondition(
      business[0]?.businessId,
      payload
    );

    if (isPublished) {
      setIsPublishing(false);
    } else {
      setIsSavingToDraft(false);
    }

    if (data?.data?.isSuccessful) {
      isPublished
        ? onOpen()
        : notify({
            title: 'Fantastic!',
            text: 'Your terms and condition has been saved',
            type: 'success',
          });
      refetch();
    } else if (data?.data?.error) {
      notify({
        title: 'Error!',
        text: data?.data?.error,
        type: 'error',
      });
    }
  };

  const isDisable = () => {
    return (
      isSavingToDraft ||
      isPublishing ||
      !editorState.getCurrentContent().hasText()
    );
  };

  useEffect(() => {
    if (data?.content) {
      const contentState = convertFromRaw(JSON.parse(data.content));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [data]);
  return (
    <section>
      <div className='flex md:flex-row flex-col justify-between md:items-center items-start'>
        <div>
          <h1 className='text-[16px] leading-8 font-semibold'>
            Terms and conditions
          </h1>
          <p
            className={`text-sm  text-grey600 ${
              data?.isPublished !== false && 'md:mb-10 mb-4'
            } `}
          >
            Your business terms and conditions
          </p>
          {data?.isPublished === false && (
            <Code className='md:mb-6 mb-2 text-sm' size='sm' color='danger'>
              Your terms and condition is ready to be published
            </Code>
          )}
        </div>
      </div>
      <div className='h-[300px] overflow-scroll'>
        <Editor
          placeholder='Write here...'
          onEditorStateChange={onEditorStateChange}
          editorState={editorState}
          toolbar={{
            options: ['inline'],
          }}
        />
      </div>
      <Spacer y={6} />
      <div className='flex flex-col md:flex-row gap-3 w-full'>
        <CustomButton
          loading={isSavingToDraft}
          disabled={isDisable()}
          onClick={(e) => submitFormData(e, false)}
          className={`${
            isDisable() ? 'text-white' : 'text-black'
          } h-[52px] bg-transparent border rounded-lg flex-grow border-grey500`}
          backgroundColor='bg-primaryColor'
        >
          Save to draft
        </CustomButton>
        <CustomButton
          loading={isPublishing}
          disabled={isDisable()}
          onClick={(e) => submitFormData(e, true)}
          className='h-[52px] flex-grow  text-white'
          backgroundColor='bg-primaryColor'
        >
          Publish
        </CustomButton>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className='grid place-content-center mt-8'>
                  <Image src={Success} alt='success' />
                </div>

                <h2 className='text-[16px] text-center leading-3 mt-3 text-black font-semibold'>
                  Fantastic!
                </h2>
                <h3 className='text-sm text-center text-grey600     mb-4'>
                  Your terms and condition has been published!
                </h3>

                <div className='flex flex-col gap-3'>
                  <CustomButton
                    onClick={async () => {
                      onOpenChange();
                    }}
                    className='h-[49px] w-full flex-grow text-black border border-[#D0D5DD]'
                    backgroundColor='bg-white'
                    type='submit'
                  >
                    Close
                  </CustomButton>
                  <CustomButton
                    onClick={async () => {
                      onOpenChange();
                      togglePreview();
                    }}
                    className='h-[49px] text-white w-full flex-grow  '
                    type='submit'
                  >
                    Preview
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal size='3xl' isOpen={isOpenPreview} onOpenChange={togglePreview}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <h2 className='text-[20px]  font-[600] mt-3 text-black '>
                  Terms and Conditions
                </h2>

                <div className='text-black text-sm'>
                  <Editor editorState={editorState} toolbarHidden readOnly />
                </div>
                <Spacer y={3} />
                <div className='flex  gap-3'>
                  <CustomButton
                    onClick={() => {
                      togglePreview();
                    }}
                    className='h-[49px] text-white w-full flex-grow  '
                    type='submit'
                  >
                    Close
                  </CustomButton>
                </div>

                <Spacer y={4} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
};

export default TermsCondition;
