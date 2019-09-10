/*
 * Generated with XD2A3 (xd2a3.heyoxe.ch) on Tue, 10 Sep 2019 19:17:24 GMT
 * 
 * GitHub Repository: https://github.com/Heyoxe/Adobe-SVG-to-Arma-Config
 * Forum Thread: soon
 * Discord: https://discord.gg/QDGatN2
 * Website: http://xd2a3.heyoxe.ch/
 * Licence: CC/BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
 */

/* Includes */
#include "IDXs.hpp"

class CoopR_Supply_Dialog {
	idd = COOPR_IDD_CoopR_Supply_Dialog;
	class Controls {
		class Help: COOPR_Button {
			idc = COOPR_IDC_Help;
			COOPR_POSITION(0,1058,118,22)
		};
		class Create: COOPR_Button_Center {
			idc = COOPR_IDC_Create;
			COOPR_POSITION(523,672,899,72)
		};
		class Background: COOPR_Background {
			idc = COOPR_IDC_Background;
			COOPR_POSITION(523,236,899,436)
		};
		class Title: COOPR_Title {
			idc = COOPR_IDC_Title;
			COOPR_POSITION(523,201,899,35)
		};
		class Back: COOPR_ButtonPicture {
			idc = COOPR_IDC_Back;
			COOPR_POSITION(1388,201,35,35)
		};
		class Misc: COOPR_ControlsGroup {
			idc = COOPR_IDC_Misc;
			COOPR_POSITION(984,638,368,29)
			class Controls {
				class SearchButton: COOPR_ButtonPicture {
					idc = COOPR_IDC_Misc_SearchButton;
					COOPR_POSITION_CT(339,0,29,29)
				};
				class SearchInput: COOPR_Input {
					idc = COOPR_IDC_Misc_SearchInput;
					COOPR_POSITION_CT(0,0,339,29)
				};
			};
		};
		class AvailableElements: COOPR_ControlsGroup {
			idc = COOPR_IDC_AvailableElements;
			COOPR_POSITION(583,268,310,343)
			class Controls {
				class AvailableElementsNumber: COOPR_Input {
					idc = COOPR_IDC_AvailableElements_AvailableElementsNumber;
					COOPR_POSITION_CT(0,314,155,29)
				};
				class AvailableElementsAdd: COOPR_Button {
					idc = COOPR_IDC_AvailableElements_AvailableElementsAdd;
					COOPR_POSITION_CT(155,314,155,29)
				};
				class AvailableElementsList: COOPR_Background {
					idc = COOPR_IDC_AvailableElements_AvailableElementsList;
					COOPR_POSITION_CT(0,0,310,314)
				};
			};
		};
		class RequestedElements: COOPR_ControlsGroup {
			idc = COOPR_IDC_RequestedElements;
			COOPR_POSITION(1042,268,310,343)
			class Controls {
				class RequestedElementsNumber: COOPR_Input {
					idc = COOPR_IDC_RequestedElements_RequestedElementsNumber;
					COOPR_POSITION_CT(0,314,155,29)
				};
				class RequestedElementsRemove: COOPR_Button {
					idc = COOPR_IDC_RequestedElements_RequestedElementsRemove;
					COOPR_POSITION_CT(155,314,155,29)
				};
				class RequestedElementsList: COOPR_Background {
					idc = COOPR_IDC_RequestedElements_RequestedElementsList;
					COOPR_POSITION_CT(0,0,310,314)
				};
			};
		};
	};
};