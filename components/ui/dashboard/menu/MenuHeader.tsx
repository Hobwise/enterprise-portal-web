import { Download, Search, X, Eye } from "lucide-react";
import { Button, ButtonGroup, Chip } from "@nextui-org/react";
import { VscLoading } from "react-icons/vsc";
import { MdOutlineFileDownload } from "react-icons/md";
import { CustomInput } from "@/components/CustomInput";
import { IoSearchOutline } from "react-icons/io5";
import { CustomButton } from "@/components/customButton";
import { toast } from "sonner";
import { generateShortMenuUrlBrowser } from "@/lib/urlShortener";

interface MenuHeaderProps {
  menuSections?: any[]; // Keep for backward compatibility but not used
  menuItems?: any[] | null; // Keep for backward compatibility but not used
  activeSubCategory?: string; // Keep for backward compatibility but not used
  isExporting: boolean;
  handleExportCSV: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories?: any[];
  businessInformation: {
    businessId: string;
    cooperateID?: string;
    businessName: string;
  }[];
  cooperateId: string | undefined;
  onPreviewClick?: () => void;
}

const MenuHeader = ({
  isExporting,
  handleExportCSV,
  searchQuery,
  onSearchChange,
  categories = [],
  onPreviewClick,
  businessInformation,
  cooperateId,
}: MenuHeaderProps) => {
  return (
    <div className="bg-white py-4 ">
      <div className="flex flex-row flex-wrap items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {categories.length > 0 ? (
              <div className="flex items-center">
                <span>Menu</span>
              </div>
            ) : (
              <span>Menu</span>
            )}
          </div>
          <p className="text-sm text-grey600">Showing all categories</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <CustomInput
              classnames={"w-[242px]"}
              label=""
              size="md"
              value={searchQuery}
              onChange={onSearchChange}
              isRequired={false}
              startContent={<IoSearchOutline />}
              type="text"
              placeholder="Search here..."
            />
          </div>

          <ButtonGroup className="border-2 border-primaryGrey divide-x-2 divide-primaryGrey rounded-lg">
            <Button
              disabled={isExporting}
              onClick={handleExportCSV}
              className="flex text-grey600 bg-white"
              title="Export"
              aria-label="Export"
            >
              Export
              {isExporting ? (
                <VscLoading className="animate-spin" />
              ) : (
                <MdOutlineFileDownload className="text-[22px]" />
              )}
            </Button>
          </ButtonGroup>
          <CustomButton
            onClick={() => {
              // Generate shortened URL using base64 encoding
              const shortUrl = generateShortMenuUrlBrowser(
                window.location.origin,
                {
                  businessID: businessInformation[0]?.businessId,
                  cooperateID: cooperateId,
                  businessName: businessInformation[0]?.businessName,
                  mode: "view",
                }
              );

              navigator.clipboard.writeText(shortUrl);
              toast.success("Short menu URL copied to clipboard!");
            }}
            className="py-2 px-4 md:mb-0 mb-4 text-primaryColor bg-white border border-primaryColor"
          >
            Copy Menu URL
          </CustomButton>
          {/* Preview Menu button commented out - functionality moved to Settings > Customize Business Display */}
          {/* {onPreviewClick && (
            <button
              onClick={onPreviewClick}
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 min-w-20 h-10 text-small gap-2 [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover bg-primaryColor rounded-lg py-2 px-4 mb-0 text-white "
            >
              <Eye className="w-5 h-5" />
              <span>Preview Menu</span>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;
