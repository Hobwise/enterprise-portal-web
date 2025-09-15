import { Download, Search, X, Eye } from "lucide-react";
import { Button, ButtonGroup, Chip } from "@nextui-org/react";
import { VscLoading } from "react-icons/vsc";
import { MdOutlineFileDownload } from "react-icons/md";
import { CustomInput } from "@/components/CustomInput";
import { IoSearchOutline } from "react-icons/io5";

interface MenuHeaderProps {
  menuSections?: any[]; // Keep for backward compatibility but not used
  menuItems?: any[] | null; // Keep for backward compatibility but not used
  activeSubCategory?: string; // Keep for backward compatibility but not used
  isExporting: boolean;
  handleExportCSV: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories?: any[];
  onPreviewClick?: () => void;
}

const MenuHeader = ({
  isExporting,
  handleExportCSV,
  searchQuery,
  onSearchChange,
  categories = [],
  onPreviewClick,
}: MenuHeaderProps) => {
  return (
    <div className="bg-white py-4 ">
      <div className="flex flex-row flex-wrap items-center justify-between">
        <div>
          <div className="text-[24px] leading-8 font-semibold">
            {categories.length > 0 ? (
              <div className="flex items-center">
                <span>Menu</span>
                <Chip
                  classNames={{
                    base: `ml-2 text-xs h-7 font-[600] w-5 bg-[#EAE5FF] text-primaryColor`,
                  }}
                >
                  {categories.length}
                </Chip>
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
            >
              {isExporting ? (
                <VscLoading className="animate-spin" />
              ) : (
                <MdOutlineFileDownload className="text-[22px]" />
              )}

              <p>Export csv</p>
            </Button>
          </ButtonGroup>
          {onPreviewClick && (
            <button
              onClick={onPreviewClick}
              className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 min-w-20 h-10 text-small gap-2 [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover bg-primaryColor rounded-lg py-2 px-4 mb-0 text-white "
            >
              <Eye className="w-5 h-5" />
              <span>Preview Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;
